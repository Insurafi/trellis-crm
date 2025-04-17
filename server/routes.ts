import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertClientSchema, 
  insertDocumentSchema, 
  insertTaskSchema, 
  insertQuoteSchema,
  insertMarketingCampaignSchema,
  insertCalendarEventSchema,
  insertPipelineStageSchema,
  insertPipelineOpportunitySchema,
  insertCommissionSchema,
  insertCommunicationTemplateSchema,
  insertUserSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { sendEmail, processTemplate, replaceAgentName } from "./email-service";
import { registerAgentLeadsPolicyRoutes } from "./routes-agents-leads-policies";
import { registerAnalyticsRoutes } from "./routes-analytics";
import { setupAuth, isAuthenticated, isAdmin, isAdminOrTeamLeader, hashPassword } from "./auth";
import { setupClientAuth, isAuthenticatedClient, comparePasswords } from "./client-auth";
import { setupSimpleRegister } from "./simple-register";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication systems
  setupAuth(app);
  setupClientAuth(app);
  setupSimpleRegister(app);
  
  // Serve static HTML files
  app.get("/pure-client-login", (req, res) => {
    res.sendFile("client-login-test.html", { root: "./client" });
  });
  
  // Serve the client portal HTML directly 
  app.get("/client-portal.html", (req, res) => {
    res.sendFile("client-portal.html", { root: "./client" });
  });
  
  // Also serve client portal HTML for direct dashboard and login routes
  app.get("/client-login-new", (req, res) => {
    res.sendFile("client-portal.html", { root: "./client" });
  });
  
  app.get("/client-dashboard-new", (req, res) => {
    res.sendFile("client-portal.html", { root: "./client" });
  });
  
  // Serve the direct client login HTML (no framework)
  app.get("/direct-client-login.html", (req, res) => {
    res.sendFile("direct-client-login.html", { root: "./client" });
  });
  
  // Serve the direct client dashboard HTML (no framework)
  app.get("/direct-client-dashboard.html", (req, res) => {
    res.sendFile("direct-client-dashboard.html", { root: "./client" });
  });
  
  // Direct client login API endpoint that doesn't go through auth middleware
  app.post("/direct-client-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log("Received direct client login request for:", username);
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Get client by username
      const client = await storage.getClientByUsername(username);
      if (!client || !client.password) {
        console.log("Client not found or no password set");
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Verify password using the imported function
      const passwordValid = await comparePasswords(password, client.password);
      if (!passwordValid) {
        console.log("Password invalid");
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Password is valid, update last login time
      await storage.updateClientLastLogin(client.id);
      
      // Remove password from response
      const { password: _, ...clientWithoutPassword } = client;
      
      // Return client info
      console.log("Direct client login successful for:", username);
      res.status(200).json({ 
        ...clientWithoutPassword,
        isClient: true,
        role: 'client',
        active: true,
        fullName: client.name
      });
    } catch (error) {
      console.error("Direct client login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Error handling middleware for validation errors
  const handleValidationError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  };

  // Dashboard Stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Clients
  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      // If user is an agent, only show clients they've interacted with through policies
      const user = req.user;
      const userRole = user?.role;
      const userId = user?.id;
      
      if (userRole === 'agent' && userId) {
        // Get agent record first
        console.log("Finding agent for user ID:", userId);
        const agent = await storage.getAgentByUserId(userId);
        
        if (agent) {
          console.log("Found agent with ID:", agent.id);
          const agentClients = await storage.getClientsByAgent(agent.id);
          return res.json(agentClients);
        } else {
          console.log("No agent record found for user, returning all clients");
        }
      }
      
      // For admin, team leaders or if agent record not found, show all clients
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  
  // Endpoint to get clients by specific agent (for admin/team leader use)
  app.get("/api/clients/by-agent/:agentId", isAuthenticated, async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      const clients = await storage.getClientsByAgent(agentId);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients by agent:", error);
      res.status(500).json({ message: "Failed to fetch clients by agent" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const newClient = await storage.createClient(clientData);
      res.status(201).json(newClient);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const updateData = insertClientSchema.partial().parse(req.body);
      const updatedClient = await storage.updateClient(id, updateData);
      
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.json(updatedClient);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const success = await storage.deleteClient(id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Documents
  app.get("/api/documents", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      let documents;
      if (clientId && !isNaN(clientId)) {
        documents = await storage.getDocumentsByClient(clientId);
      } else {
        documents = await storage.getDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const newDocument = await storage.createDocument(documentData);
      res.status(201).json(newDocument);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      let tasks;
      if (clientId && !isNaN(clientId)) {
        tasks = await storage.getTasksByClient(clientId);
      } else {
        tasks = await storage.getTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const updateData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, updateData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(updatedTask);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }

      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      let quotes;
      if (clientId && !isNaN(clientId)) {
        quotes = await storage.getQuotesByClient(clientId);
      } else {
        quotes = await storage.getQuotes();
      }
      
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }

      const quote = await storage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      res.json(quote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const newQuote = await storage.createQuote(quoteData);
      res.status(201).json(newQuote);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }

      const updateData = insertQuoteSchema.partial().parse(req.body);
      const updatedQuote = await storage.updateQuote(id, updateData);
      
      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      res.json(updatedQuote);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }

      const success = await storage.deleteQuote(id);
      if (!success) {
        return res.status(404).json({ message: "Quote not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting quote:", error);
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Marketing Campaigns
  app.get("/api/marketing/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getMarketingCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching marketing campaigns:", error);
      res.status(500).json({ message: "Failed to fetch marketing campaigns" });
    }
  });

  app.get("/api/marketing/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const campaign = await storage.getMarketingCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Marketing campaign not found" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error fetching marketing campaign:", error);
      res.status(500).json({ message: "Failed to fetch marketing campaign" });
    }
  });

  app.post("/api/marketing/campaigns", async (req, res) => {
    try {
      const campaignData = insertMarketingCampaignSchema.parse(req.body);
      const newCampaign = await storage.createMarketingCampaign(campaignData);
      res.status(201).json(newCampaign);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/marketing/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const updateData = insertMarketingCampaignSchema.partial().parse(req.body);
      const updatedCampaign = await storage.updateMarketingCampaign(id, updateData);
      
      if (!updatedCampaign) {
        return res.status(404).json({ message: "Marketing campaign not found" });
      }

      res.json(updatedCampaign);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/marketing/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }

      const success = await storage.deleteMarketingCampaign(id);
      if (!success) {
        return res.status(404).json({ message: "Marketing campaign not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting marketing campaign:", error);
      res.status(500).json({ message: "Failed to delete marketing campaign" });
    }
  });

  // Calendar Events
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      let events;
      if (clientId && !isNaN(clientId)) {
        events = await storage.getCalendarEventsByClient(clientId);
      } else {
        events = await storage.getCalendarEvents();
      }
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.get("/api/calendar/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const event = await storage.getCalendarEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Calendar event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error fetching calendar event:", error);
      res.status(500).json({ message: "Failed to fetch calendar event" });
    }
  });

  app.post("/api/calendar/events", async (req, res) => {
    try {
      console.log("Calendar event request body:", req.body);
      
      // Use the schema defined in shared/schema.ts which now handles both date and string types
      const parsedData = insertCalendarEventSchema.parse(req.body);
      console.log("Parsed calendar event data:", parsedData);
      
      const newEvent = await storage.createCalendarEvent(parsedData);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Calendar event creation error:", error);
      handleValidationError(error, res);
    }
  });

  app.patch("/api/calendar/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      // Now the schema defined in shared/schema.ts handles string dates
      const parsedData = insertCalendarEventSchema.partial().parse(req.body);
      console.log("Parsed calendar event update data:", parsedData);
      
      const updatedEvent = await storage.updateCalendarEvent(id, parsedData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Calendar event not found" });
      }

      res.json(updatedEvent);
    } catch (error) {
      console.error("Calendar event update error:", error);
      handleValidationError(error, res);
    }
  });

  app.delete("/api/calendar/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const success = await storage.deleteCalendarEvent(id);
      if (!success) {
        return res.status(404).json({ message: "Calendar event not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Pipeline Stages
  app.get("/api/pipeline/stages", async (req, res) => {
    try {
      const stages = await storage.getPipelineStages();
      res.json(stages);
    } catch (error) {
      console.error("Error fetching pipeline stages:", error);
      res.status(500).json({ message: "Failed to fetch pipeline stages" });
    }
  });

  app.get("/api/pipeline/stages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid stage ID" });
      }

      const stage = await storage.getPipelineStage(id);
      if (!stage) {
        return res.status(404).json({ message: "Pipeline stage not found" });
      }

      res.json(stage);
    } catch (error) {
      console.error("Error fetching pipeline stage:", error);
      res.status(500).json({ message: "Failed to fetch pipeline stage" });
    }
  });

  app.post("/api/pipeline/stages", async (req, res) => {
    try {
      const stageData = insertPipelineStageSchema.parse(req.body);
      const newStage = await storage.createPipelineStage(stageData);
      res.status(201).json(newStage);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/pipeline/stages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid stage ID" });
      }

      const updateData = insertPipelineStageSchema.partial().parse(req.body);
      const updatedStage = await storage.updatePipelineStage(id, updateData);
      
      if (!updatedStage) {
        return res.status(404).json({ message: "Pipeline stage not found" });
      }

      res.json(updatedStage);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/pipeline/stages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid stage ID" });
      }

      const success = await storage.deletePipelineStage(id);
      if (!success) {
        return res.status(404).json({ message: "Pipeline stage not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting pipeline stage:", error);
      res.status(500).json({ message: "Failed to delete pipeline stage" });
    }
  });

  // Pipeline Opportunities
  app.get("/api/pipeline/opportunities", isAuthenticated, async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const stageId = req.query.stageId ? parseInt(req.query.stageId as string) : undefined;
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      
      let opportunities;
      if (clientId && !isNaN(clientId)) {
        opportunities = await storage.getPipelineOpportunitiesByClient(clientId);
      } else if (stageId && !isNaN(stageId)) {
        opportunities = await storage.getPipelineOpportunitiesByStage(stageId);
      } else if (agentId && !isNaN(agentId)) {
        // Filter by assigned agent
        opportunities = await storage.getPipelineOpportunitiesByAgent(agentId);
      } else {
        // For admin/broker, show all opportunities
        if (req.user && (req.user.role === 'admin' || req.user.role === 'team_leader')) {
          opportunities = await storage.getPipelineOpportunities();
        } else if (req.user) {
          // For other roles, only show opportunities assigned to them
          opportunities = await storage.getPipelineOpportunitiesByAgent(req.user.id);
        } else {
          // If not authenticated properly, return empty array
          opportunities = [];
        }
      }
      
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching pipeline opportunities:", error);
      res.status(500).json({ message: "Failed to fetch pipeline opportunities" });
    }
  });

  app.get("/api/pipeline/opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid opportunity ID" });
      }

      const opportunity = await storage.getPipelineOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ message: "Pipeline opportunity not found" });
      }

      res.json(opportunity);
    } catch (error) {
      console.error("Error fetching pipeline opportunity:", error);
      res.status(500).json({ message: "Failed to fetch pipeline opportunity" });
    }
  });

  app.post("/api/pipeline/opportunities", async (req, res) => {
    try {
      const opportunityData = insertPipelineOpportunitySchema.parse(req.body);
      const newOpportunity = await storage.createPipelineOpportunity(opportunityData);
      res.status(201).json(newOpportunity);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/pipeline/opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid opportunity ID" });
      }

      const updateData = insertPipelineOpportunitySchema.partial().parse(req.body);
      const updatedOpportunity = await storage.updatePipelineOpportunity(id, updateData);
      
      if (!updatedOpportunity) {
        return res.status(404).json({ message: "Pipeline opportunity not found" });
      }

      res.json(updatedOpportunity);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/pipeline/opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid opportunity ID" });
      }

      const success = await storage.deletePipelineOpportunity(id);
      if (!success) {
        return res.status(404).json({ message: "Pipeline opportunity not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting pipeline opportunity:", error);
      res.status(500).json({ message: "Failed to delete pipeline opportunity" });
    }
  });

  // Commissions
  app.get("/api/commissions/stats", async (req, res) => {
    try {
      const stats = await storage.getCommissionsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching commissions stats:", error);
      res.status(500).json({ message: "Failed to fetch commissions statistics" });
    }
  });
  
  // Weekly commissions report
  app.get("/api/commissions/weekly", isAuthenticated, async (req, res) => {
    try {
      const weeklyData = await storage.getWeeklyCommissions();
      res.json(weeklyData);
    } catch (error) {
      console.error("Error fetching weekly commissions:", error);
      res.status(500).json({ message: "Failed to fetch weekly commissions" });
    }
  });

  app.get("/api/commissions", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const brokerId = req.query.brokerId ? parseInt(req.query.brokerId as string) : undefined;
      
      let commissions;
      if (clientId && !isNaN(clientId)) {
        commissions = await storage.getCommissionsByClient(clientId);
      } else if (brokerId && !isNaN(brokerId)) {
        commissions = await storage.getCommissionsByBroker(brokerId);
      } else {
        commissions = await storage.getCommissions();
      }
      
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  app.get("/api/commissions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid commission ID" });
      }

      const commission = await storage.getCommission(id);
      if (!commission) {
        return res.status(404).json({ message: "Commission not found" });
      }

      res.json(commission);
    } catch (error) {
      console.error("Error fetching commission:", error);
      res.status(500).json({ message: "Failed to fetch commission" });
    }
  });

  app.post("/api/commissions", async (req, res) => {
    try {
      const commissionData = insertCommissionSchema.parse(req.body);
      const newCommission = await storage.createCommission(commissionData);
      res.status(201).json(newCommission);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/commissions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid commission ID" });
      }

      const updateData = insertCommissionSchema.partial().parse(req.body);
      const updatedCommission = await storage.updateCommission(id, updateData);
      
      if (!updatedCommission) {
        return res.status(404).json({ message: "Commission not found" });
      }

      res.json(updatedCommission);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/commissions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid commission ID" });
      }

      const success = await storage.deleteCommission(id);
      if (!success) {
        return res.status(404).json({ message: "Commission not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting commission:", error);
      res.status(500).json({ message: "Failed to delete commission" });
    }
  });

  // Communication Templates
  app.get("/api/communication/templates", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      let templates;
      if (category) {
        templates = await storage.getCommunicationTemplatesByCategory(category);
      } else {
        templates = await storage.getCommunicationTemplates();
      }
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching communication templates:", error);
      res.status(500).json({ message: "Failed to fetch communication templates" });
    }
  });

  app.get("/api/communication/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const template = await storage.getCommunicationTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Communication template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching communication template:", error);
      res.status(500).json({ message: "Failed to fetch communication template" });
    }
  });

  app.post("/api/communication/templates", async (req, res) => {
    try {
      const templateData = insertCommunicationTemplateSchema.parse(req.body);
      const newTemplate = await storage.createCommunicationTemplate(templateData);
      res.status(201).json(newTemplate);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/communication/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const updateData = insertCommunicationTemplateSchema.partial().parse(req.body);
      const updatedTemplate = await storage.updateCommunicationTemplate(id, updateData);
      
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Communication template not found" });
      }

      res.json(updatedTemplate);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/communication/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const success = await storage.deleteCommunicationTemplate(id);
      if (!success) {
        return res.status(404).json({ message: "Communication template not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting communication template:", error);
      res.status(500).json({ message: "Failed to delete communication template" });
    }
  });

  // Email Sending API
  app.post("/api/communication/send-email", async (req, res) => {
    try {
      // Validate the request body
      const emailSchema = z.object({
        to: z.string().email(),
        from: z.string().email(), 
        subject: z.string(),
        templateId: z.number().optional(),
        customText: z.string().optional(),
        replacements: z.record(z.string()).optional(),
      });
      
      const data = emailSchema.parse(req.body);
      
      // If a template ID is provided, fetch the template and use its content
      let emailContent = data.customText || '';
      let emailSubject = data.subject;
      
      if (data.templateId) {
        const template = await storage.getCommunicationTemplate(data.templateId);
        if (!template) {
          return res.status(404).json({ message: "Email template not found" });
        }
        
        emailContent = template.content;
        
        // Use template subject if available and not overridden
        if (template.subject && !data.subject) {
          emailSubject = template.subject;
        }
      }
      
      // Get the agent's full name for [AGENT_NAME] replacement
      const agentFullName = req.user?.fullName || '';
      
      // Replace [AGENT_NAME] placeholder with the logged-in agent's full name
      emailContent = replaceAgentName(emailContent, agentFullName);
      emailSubject = replaceAgentName(emailSubject, agentFullName);
      
      // Process the template with other replacements if provided
      if (data.replacements && Object.keys(data.replacements).length > 0) {
        emailContent = processTemplate(emailContent, data.replacements);
        emailSubject = processTemplate(emailSubject, data.replacements);
      }
      
      // Check if SendGrid API key is set
      if (!process.env.SENDGRID_API_KEY) {
        return res.status(503).json({ 
          message: "Email service is not configured. Please provide a SendGrid API key.",
          configRequired: true
        });
      }
      
      // Send the email - always using inga@insurafi.co as the sender
      const result = await sendEmail({
        to: data.to,
        from: "inga@insurafi.co", // Fixed sender email
        subject: emailSubject,
        text: emailContent,
        html: emailContent.replace(/\n/g, '<br />'), // Simple HTML conversion
      });
      
      if (result) {
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send email" });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      handleValidationError(error, res);
    }
  });

  // Register the agent, leads, and policy routes
  // Users Management Routes
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      // Debugging: Log the user making the request
      console.log("User requesting /api/users:", { 
        id: req.user?.id, 
        role: req.user?.role,
        username: req.user?.username 
      });
      
      // FIX: Administrator = admin in role check - this was causing admin users to not see the team management data
      if (req.user?.role !== 'admin' && req.user?.role !== 'Administrator' && req.user?.role !== 'team_leader') {
        console.log(`User ${req.user?.username} (role: ${req.user?.role}) is not authorized to view all users`);
        console.log("Returning empty array instead of access error for better UX");
        // Return empty array instead of error for better front-end experience
        return res.json([]);
      }
      
      if (req.query.role) {
        // If a role is specified, use the existing method
        console.log(`Fetching users with role: ${req.query.role}`);
        const users = await storage.getUsersByRole(req.query.role as string);
        return res.json(users);
      } else {
        // Otherwise get all users
        console.log("Fetching all users");
        const users = await storage.getAllUsers();
        console.log(`Found ${users.length} users`);
        return res.json(users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create new user (admin only)
  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password before storing
      userData.password = await hashPassword(userData.password);
      
      const newUser = await storage.createUser(userData);
      
      // Don't include password in response
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  // Update user (admin only)
  app.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Don't allow password changes through this endpoint
      const { password, ...updateData } = insertUserSchema.partial().parse(req.body);
      
      // Check if username is being changed to one that already exists
      if (updateData.username) {
        const existingUser = await storage.getUserByUsername(updateData.username);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      const updatedUser = await storage.updateUser(id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't include password in response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  // AGENT-SPECIFIC API ROUTES
  
  // Get agent for a specific user
  app.get("/api/agents/by-user/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const agent = await storage.getAgentByUserId(userId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      return res.json(agent);
    } catch (error) {
      console.error("Error fetching agent by user ID:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get leads for a specific agent
  app.get("/api/leads/by-agent/:agentId", isAuthenticated, async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      
      // Handle special case when agentId is 0 (fallback default agent)
      if (isNaN(agentId) || agentId < 0) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      // For agentId = 0 (default agent), return empty array to avoid errors
      if (agentId === 0) {
        console.log("Received request for default agent (ID 0), returning empty leads list");
        return res.json([]);
      }
      
      const leads = await storage.getLeadsByAgent(agentId);
      return res.json(leads);
    } catch (error) {
      console.error("Error fetching leads by agent:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get policies for a specific agent
  app.get("/api/policies/by-agent/:agentId", isAuthenticated, async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      
      // Handle special case when agentId is 0 (fallback default agent)
      if (isNaN(agentId) || agentId < 0) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      // For agentId = 0 (default agent), return empty array to avoid errors
      if (agentId === 0) {
        console.log("Received request for default agent (ID 0), returning empty policy list");
        return res.json([]);
      }
      
      const policies = await storage.getPoliciesByAgent(agentId);
      return res.json(policies);
    } catch (error) {
      console.error("Error fetching policies by agent:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get commissions for a specific agent/broker
  app.get("/api/commissions/by-agent/:agentId", isAuthenticated, async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      
      // Handle special case when agentId is 0 (fallback default agent)
      if (isNaN(agentId) || agentId < 0) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      // For agentId = 0 (default agent), return empty array to avoid errors
      if (agentId === 0) {
        console.log("Received request for default agent (ID 0), returning empty commission list");
        return res.json([]);
      }
      
      const commissions = await storage.getCommissionsByBroker(agentId);
      return res.json(commissions);
    } catch (error) {
      console.error("Error fetching commissions by agent:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get weekly commissions for a specific agent/broker
  app.get("/api/commissions/weekly/by-agent/:agentId", isAuthenticated, async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      
      // Handle special case when agentId is 0 or invalid
      if (isNaN(agentId) || agentId < 0) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      // For agentId = 0 (default agent), return empty array to avoid errors
      if (agentId === 0) {
        console.log("Received request for default agent (ID 0), returning empty weekly commission data");
        return res.json([]);
      }
      
      const weeklyCommissions = await storage.getWeeklyCommissionsByAgent(agentId);
      return res.json(weeklyCommissions || []);
    } catch (error) {
      console.error("Error fetching weekly commissions by agent:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create a new API endpoint specifically for getting agent details by ID
  // This won't conflict with the frontend routing
  app.get("/api/agent-data/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      // Log agent details for debugging
      console.log(`Fetched agent ${id} with full info from direct endpoint:`, {
        id: agent.id,
        fullName: agent.fullName,
        email: agent.email,
        commissionPercentage: agent.commissionPercentage
      });
      
      // Return the agent data in JSON format
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent data:", error);
      res.status(500).json({ message: "Failed to fetch agent data" });
    }
  });

    // Commented out duplicate route that was causing issues
  // app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
  //   try {
  //     const users = await storage.getAllUsers();
  //     res.json(users);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //     res.status(500).json({ message: "Failed to fetch users" });
  //   }
  // });
  
  registerAgentLeadsPolicyRoutes(app);
  registerAnalyticsRoutes(app);
  
  // Diagnostic test route
  app.get("/api/client-auth-test", async (req, res) => {
    try {
      console.log("Running internal client auth test");
      
      // Same origin fetch to test client login API
      const response = await fetch("http://localhost:5000/api/client/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: "client", password: "password" }),
      });
      
      const statusCode = response.status;
      let responseData = null;
      
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: "Failed to parse JSON response" };
      }
      
      res.json({
        success: response.ok,
        statusCode,
        responseData,
        headers: Object.fromEntries(response.headers.entries()),
      });
    } catch (error) {
      console.error("Client auth test error:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Client Portal API Routes
  app.get("/api/client/info", isAuthenticatedClient, async (req, res) => {
    try {
      // Client info is already in req.user with isClient: true
      if (req.user && (req.user as any).isClient) {
        const clientId = req.user.id;
        const client = await storage.getClient(clientId);
        
        if (!client) {
          return res.status(404).json({ message: "Client information not found" });
        }
        
        // Update last login timestamp
        await storage.updateClientLastLogin(clientId);
        
        res.json(client);
      } else {
        res.status(401).json({ message: "Not authenticated as a client" });
      }
    } catch (error) {
      console.error("Error fetching client info:", error);
      res.status(500).json({ message: "Failed to fetch client information" });
    }
  });
  
  app.get("/api/client/documents", isAuthenticatedClient, async (req, res) => {
    try {
      if (req.user && (req.user as any).isClient) {
        const clientId = req.user.id;
        const documents = await storage.getDocumentsByClient(clientId);
        res.json(documents);
      } else {
        res.status(401).json({ message: "Not authenticated as a client" });
      }
    } catch (error) {
      console.error("Error fetching client documents:", error);
      res.status(500).json({ message: "Failed to fetch client documents" });
    }
  });
  
  app.get("/api/client/policies", isAuthenticatedClient, async (req, res) => {
    try {
      if (req.user && (req.user as any).isClient) {
        const clientId = req.user.id;
        const policies = await storage.getPoliciesByClient(clientId);
        res.json(policies);
      } else {
        res.status(401).json({ message: "Not authenticated as a client" });
      }
    } catch (error) {
      console.error("Error fetching client policies:", error);
      res.status(500).json({ message: "Failed to fetch client policies" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
