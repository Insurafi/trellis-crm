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

  // Get agent by user ID - must come before the :id route to avoid param conflicts
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
      let agent = await storage.getAgentByUserId(req.user.id);
      
      if (!agent) {
        // If no agent found for this user, create a default agent record
        console.log("No agent found for user ID:", req.user.id, "Creating one...");
        
        try {
          // Create a license expiration date 2 years from now
          const licenseExpirationDate = new Date();
          licenseExpirationDate.setFullYear(licenseExpirationDate.getFullYear() + 2);
          const licenseExpiration = licenseExpirationDate.toISOString().split('T')[0];

          agent = await storage.createAgent({
            userId: req.user.id,
            licenseNumber: `AG${100000 + req.user.id}`,
            licenseExpiration: licenseExpiration,
            phoneNumber: "(555) 555-5555", // Default phone number
            address: "",
            city: "",
            state: "",
            zipCode: "",
            carrierAppointments: "",
            commissionPercentage: "70.00",
            specialties: "",
            notes: "Auto-generated agent record"
          });
          console.log("Created agent record:", agent);
        } catch (error) {
          console.error("Error creating agent record:", error);
          // If we can't create an agent, still return a valid response with the user's data
          return res.status(200).json({ 
            id: 0, // Use 0 instead of null to prevent invalid ID errors
            userId: req.user.id, 
            firstName: req.user.firstName || "",
            lastName: req.user.lastName || "",
            fullName: req.user.fullName || "",
            licenseNumber: `AG${100000 + req.user.id}`,
            licenseExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
            phoneNumber: "(555) 555-5555",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            carrierAppointments: "",
            commissionPercentage: "70.00",
            specialties: "",
            notes: "Default agent record"
          });
        }
      }
      
      // If the agent ID is missing or invalid, set it to 0 to avoid issues in client code
      if (!agent || !agent.id) {
        agent = {
          ...agent,
          id: 0
        };
      }
      
      console.log("Returning agent data:", agent);
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent for current user:", error);
      
      // Return a default agent object with ID=0 instead of an error
      // This ensures client code can continue functioning
      return res.status(200).json({ 
        id: 0, 
        userId: req.user?.id, 
        firstName: req.user?.firstName || "",
        lastName: req.user?.lastName || "",
        fullName: req.user?.fullName || "",
        licenseNumber: `AG${100000 + (req.user?.id || 0)}`,
        licenseExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
        phoneNumber: "(555) 555-5555",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        carrierAppointments: "",
        commissionPercentage: "70.00",
        specialties: "",
        notes: "Error fallback agent record"
      });
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
      let userId = agentData.userId;
      
      // Create user account if login credentials provided (username and password)
      if (agentData.username && agentData.password && agentData.firstName && agentData.lastName) {
        try {
          const { username, password, email } = agentData;
          
          // Hash the password before storing
          const hashedPassword = await storage.hashPassword(password);
          
          // Create a new user with agent role
          const newUser = await storage.createUser({
            username,
            password: hashedPassword,
            email: email || '',
            firstName: agentData.firstName,
            lastName: agentData.lastName,
            role: 'agent',
            active: true
          });
          
          console.log(`Created new user account for agent: ${newUser.username} (ID: ${newUser.id})`);
          
          // Set the userId for the agent record
          userId = newUser.id;
          
          // Remove login credentials from agentData since they're now in the user record
          delete agentData.username;
          delete agentData.password;
          delete agentData.email;
        } catch (userError) {
          console.error("Error creating user account for agent:", userError);
          return res.status(400).json({ 
            message: "Failed to create user account for agent", 
            details: userError.message 
          });
        }
      }
      
      // Always use the first and last name from the form for the agent record
      if (agentData.firstName && agentData.lastName) {
        try {
          // If there's a userId but we didn't just create it above, update that user's name
          if (userId && !agentData.username) { // If username exists, we created the user above
            await storage.updateUser(userId, {
              firstName: agentData.firstName,
              lastName: agentData.lastName
            });
          }
          
          // Remove first/last name from agentData - these go in User table, not Agent table
          delete agentData.firstName;
          delete agentData.lastName;
        } catch (userError) {
          console.error("Error updating user data for agent:", userError);
          // Continue with agent creation even if user update fails
        }
      }
      
      // Set the userId for the agent (either from original data or newly created user)
      if (userId) {
        agentData.userId = userId;
      }
      
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
      
      // First, handle firstName/lastName updates if provided
      if (updateData.firstName || updateData.lastName) {
        try {
          // Get the agent to find the associated user
          const agent = await storage.getAgent(id);
          if (agent && agent.userId) {
            // Update the user's first/last name
            const userUpdateData: any = {};
            if (updateData.firstName) userUpdateData.firstName = updateData.firstName;
            if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
            
            await storage.updateUser(agent.userId, userUpdateData);
            
            // Remove first/last name from agentData to avoid duplication
            delete updateData.firstName;
            delete updateData.lastName;
          }
        } catch (userError) {
          console.error("Error updating user data for agent:", userError);
          // Continue with agent update even if user update fails
        }
      }

      const updatedAgent = await storage.updateAgent(id, updateData);
      
      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json(updatedAgent);
    } catch (error) {
      handleValidationError(error, res);
    }
  });
  
  // Special endpoint for updating agent commission (admin-only)
  app.patch("/api/agents/:id/commission", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      // Validate commission is a valid number
      const { commissionPercentage } = req.body;
      if (!commissionPercentage || isNaN(parseFloat(commissionPercentage))) {
        return res.status(400).json({ message: "Invalid commission percentage" });
      }
      
      // Ensure commission is between 0 and 100
      const commission = parseFloat(commissionPercentage);
      if (commission < 0 || commission > 100) {
        return res.status(400).json({ message: "Commission must be between 0 and 100 percent" });
      }

      const updatedAgent = await storage.updateAgent(id, { 
        commissionPercentage: commissionPercentage 
      });
      
      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json(updatedAgent);
    } catch (error) {
      console.error("Error updating agent commission:", error);
      res.status(500).json({ message: "Failed to update agent commission" });
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
  
  // Get agent by ID - this must come last of all agent routes
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

      // The agent data already includes fullName from the database-storage.ts changes
      console.log(`Fetched agent ${id} successfully:`, {
        id: agent.id,
        fullName: agent.fullName,
        email: agent.email,
        commissionPercentage: agent.commissionPercentage
      });
      
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
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
      
      // Handle special case when agentId is 0 (fallback default agent)
      if (isNaN(agentId) || agentId < 0) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      // For agentId = 0 (default agent), return empty array to avoid errors
      if (agentId === 0) {
        console.log("Received request for default agent (ID 0), returning empty list");
        return res.json([]);
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