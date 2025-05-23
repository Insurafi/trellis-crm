import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { Client as SelectClient } from "@shared/schema";
import { storage } from "./storage";
import { hashPassword } from "./auth";

declare global {
  namespace Express {
    interface User {
      isClient?: boolean;
      // Add required User properties for client objects
      role?: string;
      active?: boolean;
      fullName?: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function comparePasswords(supplied: string, stored: string) {
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

export function setupClientAuth(app: Express) {
  // Use a different strategy name for client authentication
  passport.use("client-local", 
    new LocalStrategy(async (username, password, done) => {
      try {
        const client = await storage.getClientByUsername(username);
        if (!client || !client.password || !(await comparePasswords(password, client.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          // Ensure username isn't null to satisfy the User interface
          const clientUsername = client.username || username;
          
          // Add required User interface properties for the client
          return done(null, { 
            ...client, 
            username: clientUsername, // Ensure username is not null
            isClient: true,
            role: 'client',  // Add role property to satisfy User interface
            active: true,    // Add active property to satisfy User interface
            fullName: client.name // Use name as fullName to satisfy User interface
          });
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Client login route
  app.post("/api/client/login", (req, res, next) => {
    passport.authenticate("client-local", (err: Error, client: SelectClient & { isClient: boolean }, info: { message: string }) => {
      if (err) return next(err);
      if (!client) {
        return res.status(401).json({ message: info.message || "Invalid username or password" });
      }
      req.login(client, async (err) => {
        if (err) return next(err);
        
        // Update last login time
        await storage.updateClientLastLogin(client.id);
        
        // Don't include password in response
        const { password, ...clientWithoutPassword } = client;
        return res.json(clientWithoutPassword);
      });
    })(req, res, next);
  });
  
  // Client logout route
  app.post("/api/client/logout", (req, res) => {
    console.log("Client logout route hit");
    req.logout((err) => {
      if (err) {
        console.error("Error during client logout:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Client registration (enabling portal access for existing clients)
  app.post("/api/client/enable-portal", async (req, res, next) => {
    try {
      const { clientId, username, password } = req.body;
      
      if (!clientId || !username || !password) {
        return res.status(400).json({ message: "Client ID, username, and password are required" });
      }
      
      // Check if client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if username is already taken
      const existingClient = await storage.getClientByUsername(username);
      if (existingClient && existingClient.id !== clientId) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password and enable portal access
      const hashedPassword = await hashPassword(password);
      const updatedClient = await storage.enableClientPortalAccess(clientId, username, hashedPassword);
      
      if (!updatedClient) {
        return res.status(500).json({ message: "Failed to enable portal access" });
      }
      
      // Don't include password in response
      const { password: clientPassword, ...clientWithoutPassword } = updatedClient;
      res.status(200).json(clientWithoutPassword);
    } catch (error) {
      console.error("Portal access error:", error);
      res.status(500).json({ message: "Failed to enable portal access" });
    }
  });

  // Client info route
  app.get("/api/client/info", isAuthenticatedClient, async (req, res) => {
    console.log("Client info route hit, user:", req.user);
    console.log("isAuthenticated:", req.isAuthenticated());
    
    try {
      // Get client info from the authenticated user in the session
      const userId = req.user?.id;
      
      // If no user ID is available, try to use the hardcoded test client
      // This is a fallback for development, but should retrieve from session
      const client = userId 
        ? await storage.getClient(userId)
        : await storage.getClientByUsername("client");
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Don't include password in response
      const { password, ...clientWithoutPassword } = client;
      
      // Add isClient flag for consistency
      const responseData = {
        ...clientWithoutPassword,
        isClient: true
      };
      
      res.json(responseData);
    } catch (error) {
      console.error("Error fetching client data:", error);
      res.status(500).json({ message: "Error retrieving client information" });
    }
  });
  
  // Client documents route
  app.get("/api/client/documents", isAuthenticatedClient, async (req, res) => {
    console.log("Client documents route hit, user:", req.user);
    console.log("isAuthenticated:", req.isAuthenticated());
    
    try {
      // Get client ID from session user
      const clientId = req.user?.id || 1; // Fallback to ID 1 for development
      const documents = await storage.getDocumentsByClient(clientId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching client documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  // Client policies route
  app.get("/api/client/policies", isAuthenticatedClient, async (req, res) => {
    console.log("Client policies route hit, user:", req.user);
    console.log("isAuthenticated:", req.isAuthenticated());
    
    try {
      // Get client ID from session user
      const clientId = req.user?.id || 1; // Fallback to ID 1 for development
      const policies = await storage.getPoliciesByClient(clientId);
      res.json(policies);
    } catch (error) {
      console.error("Error fetching client policies:", error);
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });
}

// Middleware to check if user is an authenticated client
export function isAuthenticatedClient(req: any, res: any, next: any) {
  console.log("isAuthenticatedClient middleware, user:", req.user);
  console.log("isAuthenticated:", req.isAuthenticated());
  
  // Check if user is authenticated AND has the isClient flag
  if (req.isAuthenticated() && req.user.isClient === true) {
    console.log("Valid client authenticated:", req.user.id);
    return next();
  }
  
  // If authenticated but not a client, provide a clear error
  if (req.isAuthenticated() && !req.user.isClient) {
    console.log("Authenticated user is not a client:", req.user.id);
    return res.status(403).json({ message: "Access denied: Not a client account" });
  }
  
  // Otherwise, not authenticated
  console.log("Not authenticated at all");
  res.status(401).json({ message: "Unauthorized" });
}