import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { registerAgentLeadsPolicyRoutes } from "./routes-agents-leads-policies";
import { setupAnalyticsRoutes } from "./routes-analytics";
import path from "path";
import fs from "fs";
import { setupClientAuth, isAuthenticatedClient } from "./client-auth";
import syncExistingPolicies from "./sync-existing-policies-to-clients";
import { setupOnlineStatusCleanup } from "./online-status-cleanup";
import { storage } from "./storage";

// IMPORTANT: This block has been commented out to prevent automatic lead-to-client conversion
// import syncExistingLeads from "./sync-existing-leads-to-clients";

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  setupClientAuth(app);

  // Special download handlers - added for user to download codebase
  app.get("/download.zip", (req, res) => {
    const filePath = path.resolve("export-trellis-crm.zip");
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=trellis-crm-code.zip");
      return fs.createReadStream(filePath).pipe(res);
    } else {
      return res.status(404).send("Download file not found");
    }
  });

  app.get("/download.html", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Download Trellis CRM Code</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
          h1 { color: #3b82f6; margin-bottom: 2rem; }
          .button { background-color: #3b82f6; color: white; padding: 1rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: bold; display: inline-block; margin: 1rem 0; }
          .button:hover { background-color: #2563eb; }
          pre { background-color: #f1f5f9; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
          .success { color: #16a34a; font-weight: bold; }
          .error { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Download Trellis CRM Code</h1>
        <p>Click the button below to download the complete Trellis CRM codebase as a ZIP file.</p>
        <a href="/download.zip" class="button">Download Trellis CRM Code (ZIP)</a>
        <p>File size: ~1.88MB</p>
        <hr>
        <h2>What's included:</h2>
        <ul>
          <li>Frontend code (React, TypeScript)</li>
          <li>Backend code (Node.js, Express.js)</li>
          <li>Database schema (PostgreSQL, Drizzle ORM)</li>
          <li>Configuration files</li>
        </ul>
      </body>
      </html>
    `);
  });

  // API routes
  registerAgentLeadsPolicyRoutes(app);
  // setupAnalyticsRoutes(app);  // Commented out since it doesn't exist

  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    const tasks = await storage.getTasks(req.user?.id as number);
    res.json(tasks);
  });

  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const task = await storage.createTask({
        ...req.body,
        userId: req.user?.id as number,
      });
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Error creating task" });
    }
  });

  app.put("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const task = await storage.updateTask(parseInt(req.params.id), {
        ...req.body,
        userId: req.user?.id as number,
      });
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Error updating task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTask(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  // User profile endpoint
  app.get("/api/profile", isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  // Update user profile endpoint
  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const updatedUser = await storage.updateUserProfile(
        req.user?.id as number,
        req.body
      );
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  // User online status endpoint
  app.post(
    "/api/users/:id/online-status",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const { status } = req.body;

        if (userId !== req.user?.id && req.user?.role !== "Administrator") {
          return res
            .status(403)
            .json({ message: "Not authorized to update another user's status" });
        }

        await storage.updateUserOnlineStatus(userId, status);
        console.log(`User ${userId} status updated to ${status}`);
        console.log(`User ${userId} is now ${status.toUpperCase()}`);
        res.json({ success: true, status });
      } catch (error) {
        console.error("Error updating online status:", error);
        res.status(500).json({ message: "Error updating online status" });
      }
    }
  );

  // Search endpoint with multi-entity support
  app.get("/api/search", isAuthenticated, async (req, res) => {
    try {
      const { query, types } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      // Default to all entity types if not specified
      const searchTypes = types
        ? (types as string).split(",")
        : ["clients", "leads", "policies"];

      const results = await storage.searchEntities(
        query as string,
        searchTypes,
        req.user
      );
      res.json(results);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Error performing search" });
    }
  });

  // Client Portal API routes
  app.get(
    "/api/client-portal/policies",
    isAuthenticatedClient,
    async (req, res) => {
      try {
        const clientId = (req.user as any).id;
        const policies = await storage.getPoliciesByClientId(clientId);
        res.json(policies);
      } catch (error) {
        console.error("Error fetching client policies:", error);
        res.status(500).json({ message: "Error fetching policies" });
      }
    }
  );

  app.get(
    "/api/client-portal/documents",
    isAuthenticatedClient,
    async (req, res) => {
      try {
        const clientId = (req.user as any).id;
        const documents = await storage.getDocumentsByClientId(clientId);
        res.json(documents);
      } catch (error) {
        console.error("Error fetching client documents:", error);
        res.status(500).json({ message: "Error fetching documents" });
      }
    }
  );

  app.get(
    "/api/client-portal/communications",
    isAuthenticatedClient,
    async (req, res) => {
      try {
        const clientId = (req.user as any).id;
        const communications = await storage.getCommunicationsByClientId(
          clientId
        );
        res.json(communications);
      } catch (error) {
        console.error("Error fetching client communications:", error);
        res.status(500).json({ message: "Error fetching communications" });
      }
    }
  );

  // Client API endpoint (for communications)
  app.get("/api/clients/:id/communications", isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const communications = await storage.getCommunicationsByClientId(clientId);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching client communications:", error);
      res.status(500).json({ message: "Error fetching client communications" });
    }
  });

  // Create communication endpoint
  app.post("/api/communications", isAuthenticated, async (req, res) => {
    try {
      const communication = await storage.createCommunication({
        ...req.body,
        userId: req.user?.id as number,
      });
      res.status(201).json(communication);
    } catch (error) {
      console.error("Error creating communication:", error);
      res.status(500).json({ message: "Error creating communication" });
    }
  });

  // Delete communication endpoint
  app.delete("/api/communications/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCommunication(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting communication:", error);
      res.status(500).json({ message: "Error deleting communication" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received message:", data);

        // Handle different message types
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  // Initialize background tasks
  syncExistingPolicies();
  
  // IMPORTANT: This block has been commented out to prevent automatic lead-to-client conversion
  // syncExistingLeads();
  
  setupOnlineStatusCleanup();

  return httpServer;
}