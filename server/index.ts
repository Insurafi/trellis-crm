import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeData } from "./initialize-data";
import { initializePipelineData } from "./initialize-pipeline-data";
import { initializeCommissionData } from "./initialize-commission-data";
import { syncExistingLeadsToClients } from "./sync-existing-leads-to-clients";
import { syncExistingPoliciesToClients } from "./sync-existing-policies-to-clients";
import { setupOnlineStatusCleanup } from "./online-status-cleanup";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Initialize database with sample data
    try {
      // First synchronize leads with clients to ensure proper associations
      await syncExistingLeadsToClients();
      
      // Then synchronize policies with clients to ensure proper linkage
      await syncExistingPoliciesToClients();
      
      // Initialize database with sample data
      await initializeData();
      
      // Initialize pipeline data after basic data is loaded
      await initializePipelineData();
      
      // Initialize commission data
      await initializeCommissionData();
      
      // Start the online status cleanup job
      setupOnlineStatusCleanup();
    } catch (error) {
      log(`Error initializing data: ${error}`);
    }
  });
})();
