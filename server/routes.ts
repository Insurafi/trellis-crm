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
  insertCalendarEventSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
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

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const newClient = await storage.createClient(clientData);
      res.status(201).json(newClient);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
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

  app.delete("/api/clients/:id", async (req, res) => {
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
      const eventData = insertCalendarEventSchema.parse(req.body);
      const newEvent = await storage.createCalendarEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/calendar/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const updateData = insertCalendarEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateCalendarEvent(id, updateData);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Calendar event not found" });
      }

      res.json(updatedEvent);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
