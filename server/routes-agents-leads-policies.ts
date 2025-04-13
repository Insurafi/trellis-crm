import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertAgentSchema, insertLeadSchema, insertPolicySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { isAuthenticated, isAdmin, isAdminOrTeamLeader } from "./auth";

export function registerAgentLeadsPolicyRoutes(app: Express) {
  // Error handling middleware for validation errors
  const handleValidationError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  };

  // Agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.get("/api/agents/user/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const agent = await storage.getAgentByUserId(userId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found for this user" });
      }

      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent by user ID:", error);
      res.status(500).json({ message: "Failed to fetch agent by user ID" });
    }
  });
  
  app.get("/api/agents/by-user", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      console.log("Attempting to find agent for user ID:", req.user.id);
      const agent = await storage.getAgentByUserId(req.user.id);
      
      if (!agent) {
        // If no agent found for this user, create a default response with empty values
        // This prevents errors in the frontend when an agent record doesn't exist yet
        return res.status(200).json({ 
          id: null,
          userId: req.user.id, 
          fullName: req.user.fullName || "",
        });
      }
      
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent for current user:", error);
      res.status(500).json({ message: "Failed to fetch agent data" });
    }
  });

  app.get("/api/agents/upline/:uplineId", async (req, res) => {
    try {
      const uplineId = parseInt(req.params.uplineId);
      if (isNaN(uplineId)) {
        return res.status(400).json({ message: "Invalid upline agent ID" });
      }

      const agents = await storage.getAgentsByUpline(uplineId);
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents by upline:", error);
      res.status(500).json({ message: "Failed to fetch agents by upline" });
    }
  });

  app.post("/api/agents", isAdminOrTeamLeader, async (req, res) => {
    try {
      const agentData = insertAgentSchema.parse(req.body);
      const newAgent = await storage.createAgent(agentData);
      res.status(201).json(newAgent);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/agents/:id", isAdminOrTeamLeader, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      const updateData = insertAgentSchema.partial().parse(req.body);
      const updatedAgent = await storage.updateAgent(id, updateData);
      
      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json(updatedAgent);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/agents/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      const success = await storage.deleteAgent(id);
      if (!success) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // Leads
  app.get("/api/leads", isAuthenticated, async (req, res) => {
    try {
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      
      let leads;
      if (agentId && !isNaN(agentId)) {
        leads = await storage.getLeadsByAgent(agentId);
      } else {
        leads = await storage.getLeads();
      }
      
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/by-agent/:agentId", isAuthenticated, async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      const leads = await storage.getLeadsByAgent(agentId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads by agent:", error);
      res.status(500).json({ message: "Failed to fetch leads by agent" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", isAuthenticated, async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const newLead = await storage.createLead(leadData);
      res.status(201).json(newLead);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      const updateData = insertLeadSchema.partial().parse(req.body);
      const updatedLead = await storage.updateLead(id, updateData);
      
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json(updatedLead);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/leads/:id", isAdminOrTeamLeader, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      const success = await storage.deleteLead(id);
      if (!success) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Policies
  app.get("/api/policies", isAuthenticated, async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      
      let policies;
      if (clientId && !isNaN(clientId)) {
        policies = await storage.getPoliciesByClient(clientId);
      } else if (leadId && !isNaN(leadId)) {
        policies = await storage.getPoliciesByLead(leadId);
      } else if (agentId && !isNaN(agentId)) {
        policies = await storage.getPoliciesByAgent(agentId);
      } else {
        policies = await storage.getPolicies();
      }
      
      res.json(policies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  app.get("/api/policies/by-agent/:agentId", isAuthenticated, async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      const policies = await storage.getPoliciesByAgent(agentId);
      res.json(policies);
    } catch (error) {
      console.error("Error fetching policies by agent:", error);
      res.status(500).json({ message: "Failed to fetch policies by agent" });
    }
  });

  app.get("/api/policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid policy ID" });
      }

      const policy = await storage.getPolicy(id);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }

      res.json(policy);
    } catch (error) {
      console.error("Error fetching policy:", error);
      res.status(500).json({ message: "Failed to fetch policy" });
    }
  });

  app.post("/api/policies", isAuthenticated, async (req, res) => {
    try {
      const policyData = insertPolicySchema.parse(req.body);
      const newPolicy = await storage.createPolicy(policyData);
      res.status(201).json(newPolicy);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.patch("/api/policies/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid policy ID" });
      }

      const updateData = insertPolicySchema.partial().parse(req.body);
      const updatedPolicy = await storage.updatePolicy(id, updateData);
      
      if (!updatedPolicy) {
        return res.status(404).json({ message: "Policy not found" });
      }

      res.json(updatedPolicy);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/policies/:id", isAdminOrTeamLeader, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid policy ID" });
      }

      const success = await storage.deletePolicy(id);
      if (!success) {
        return res.status(404).json({ message: "Policy not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting policy:", error);
      res.status(500).json({ message: "Failed to delete policy" });
    }
  });
}