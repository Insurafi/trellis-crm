import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { User as SelectUser } from "@shared/schema";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { sql } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

declare global {
  namespace Express {
    // Use Partial to make all properties optional, allowing both user and client auth to work
    interface User {
      id: number;
      username: string;
      email: string;
      name?: string;
      fullName?: string;
      role?: string;
      active?: boolean;
      isClient?: boolean;
      [key: string]: any; // Allow other properties for both User and Client objects
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // First check if the password is stored in plain text (temporary for development)
  if (!stored.includes(".")) {
    return supplied === stored;
  }
  
  // Otherwise, compare with hashed password
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'insurance-crm-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({ 
      pool, 
      tableName: 'user_sessions',
      createTableIfMissing: true 
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration attempt for username:", req.body.username);
      
      // Validate required fields
      if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({ 
          message: "Missing required fields. Username, password, and email are required." 
        });
      }
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("Registration failed: Username already exists:", req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      // Split fullName into firstName and lastName if needed
      let firstName = req.body.firstName;
      let lastName = req.body.lastName;
      
      if ((!firstName || !lastName) && req.body.fullName) {
        const nameParts = req.body.fullName.trim().split(/\s+/);
        if (nameParts.length > 1) {
          firstName = firstName || nameParts[0];
          lastName = lastName || nameParts.slice(1).join(' ');
        } else {
          firstName = firstName || req.body.fullName;
          lastName = lastName || '-'; // Default last name if not available
        }
      }
      
      // Ensure role is set
      const userData = {
        ...req.body,
        firstName: firstName || req.body.username.split(' ')[0], // Default to username if no first name
        lastName: lastName || '-', // Default to dash if no last name
        role: req.body.role || "agent", // Default to agent if no role provided
        password: await hashPassword(req.body.password),
      };
      
      console.log("Creating user with data:", { 
        ...userData, 
        password: "******" // Don't log the actual password
      });
      
      const user = await storage.createUser(userData);
      
      console.log("User created successfully:", user.id);

      req.login(user, (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return next(err);
        }
        // Don't include password in response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Failed to create user",
        details: process.env.NODE_ENV !== 'production' ? String(error) : undefined
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for username:", req.body.username);
    
    passport.authenticate("local", async (err: Error, user: SelectUser, info: { message: string }) => {
      if (err) {
        console.error("Login authentication error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed for username:", req.body.username, "- Reason:", info?.message || "Invalid credentials");
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }
      
      console.log("Login successful for user:", user.id, user.username);
      
      // Update the user's online status in the database
      try {
        await db.execute(
          sql`UPDATE users SET is_online = TRUE, last_active = NOW() WHERE id = ${user.id}`
        );
        console.log(`User ${user.username} (ID: ${user.id}) marked as online`);
      } catch (updateError) {
        console.error("Failed to update online status during login:", updateError);
        // Continue login process even if status update fails
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("Session creation error during login:", err);
          return next(err);
        }
        // Don't include password in response
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    // Update user's online status to offline before logging out
    try {
      if (req.user && req.user.id) {
        await db.execute(
          sql`UPDATE users SET is_online = FALSE, last_active = NOW() WHERE id = ${req.user.id}`
        );
        console.log(`User ${req.user.username} (ID: ${req.user.id}) marked as offline during logout`);
      }
    } catch (updateError) {
      console.error("Failed to update online status during logout:", updateError);
      // Continue logout process even if status update fails
    }
    
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ success: true });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // Don't include password in response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user is an admin
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user && (req.user.role === "admin" || req.user.role === "Administrator")) {
    return next();
  }
  res.status(403).json({ message: "Access denied" });
}

// Middleware to check if user is an admin or team leader
export function isAdminOrTeamLeader(req: any, res: any, next: any) {
  if (
    req.isAuthenticated() && 
    req.user && 
    (req.user.role === "admin" || req.user.role === "Administrator" || 
     req.user.role === "team_leader" || req.user.role === "Team Leader")
  ) {
    return next();
  }
  res.status(403).json({ message: "Access denied" });
}

// Middleware to check if user is admin or the user themself (for accessing own resources)
export function isAdminOrSelf(req: any, res: any, next: any) {
  if (
    req.isAuthenticated() && 
    req.user && 
    (req.user.role === "admin" || req.user.role === "Administrator" || req.user.id === parseInt(req.params.id))
  ) {
    return next();
  }
  res.status(403).json({ message: "Access denied" });
}

// Middleware to check if user has specific role(s)
export function hasRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user && req.user.role) {
      // Map common variations of role names
      const normalizedRoles = roles.flatMap(role => {
        if (role === 'admin') return ['admin', 'Administrator'];
        if (role === 'team_leader') return ['team_leader', 'Team Leader'];
        return [role];
      });
      
      if (normalizedRoles.includes(req.user.role)) {
        return next();
      }
    }
    res.status(403).json({ message: "Access denied" });
  };
}