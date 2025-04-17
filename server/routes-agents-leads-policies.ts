import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertAgentSchema, insertLeadSchema, insertPolicySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { isAuthenticated, isAdmin, isAdminOrTeamLeader, hashPassword } from "./auth";
import { sendAgentWelcomeEmail } from "./agent-welcome-email";
import { syncLeadToClient } from "./lead-client-sync";

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
  




  app.post("/api/agents", isAuthenticated, async (req, res) => {
    try {
      // Log the incoming data for debugging
      console.log("Received agent creation data:", req.body);
      
      const agentData = insertAgentSchema.parse(req.body);
      let userId = agentData.userId;
      
      // Store firstName and lastName for later use (we'll need to attach these to the response)
      const firstName = agentData.firstName || '';
      const lastName = agentData.lastName || '';
      
      // If we're just adding a name (simplified agent creation)
      if (firstName && lastName && !agentData.licenseNumber) {
        console.log("Simplified agent creation with just name:", firstName, lastName);
        
        try {
          // Generate a username if not provided
          const username = agentData.username || 
            `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
          
          // Generate a temporary password if not provided
          const password = agentData.password || `temp${Math.floor(Math.random() * 10000)}`;
          
          // Generate a placeholder email if not provided
          const email = agentData.email || `${username}@example.com`;
          
          // Create a new user with agent role
          const newUser = await storage.createUser({
            username,
            password: await hashPassword(password),
            email: email,
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`, // Set full name as well
            role: 'agent',
            active: true
          });
          
          console.log(`Created new user account for agent: ${newUser.username} (ID: ${newUser.id})`);
          
          // Create a minimal agent record with placeholder data
          const placeholderAgent = {
            userId: newUser.id,
            licenseNumber: `TEMP-${newUser.id}`,
            licenseExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Convert to string format
            phoneNumber: '000-000-0000', // Placeholder phone
            notes: 'Created with simplified process. Update with complete details.'
          };
          
          const newAgent = await storage.createAgent(placeholderAgent);
          
          // Include user information in the response for reference
          const responseData = {
            ...newAgent,
            firstName,
            lastName,
            username,
            temporaryPassword: password
          };
          
          // Send welcome email with credentials if email is provided
          if (email) {
            try {
              // Send email in background to not block the response
              sendAgentWelcomeEmail({
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                username: username || '',
                temporaryPassword: password || '',
                email
              }).then(success => {
                if (success) {
                  console.log(`Welcome email sent to ${firstName} ${lastName} (${email})`);
                } else {
                  console.error(`Failed to send welcome email to ${email}`);
                }
              }).catch(err => {
                console.error('Error sending welcome email:', err);
              });
            } catch (emailError) {
              console.error('Error initiating welcome email:', emailError);
              // Continue even if email sending fails
            }
          }
          
          return res.status(201).json(responseData);
        } catch (error: any) {
          console.error("Error in simplified agent creation:", error);
          return res.status(400).json({
            message: "Failed to create simplified agent record",
            details: error.message || 'Unknown error'
          });
        }
      }
      
      // Standard flow - Create user account if login credentials provided
      if (agentData.username && agentData.password && firstName && lastName) {
        try {
          const { username, password, email } = agentData;
          
          // Hash the password before storing
          const hashedPassword = await hashPassword(password);
          
          // Create a new user with agent role
          const newUser = await storage.createUser({
            username,
            password: hashedPassword,
            email: email || '',
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`, // Set full name as well
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
        } catch (userError: any) {
          console.error("Error creating user account for agent:", userError);
          return res.status(400).json({ 
            message: "Failed to create user account for agent", 
            details: userError.message || 'Unknown error'
          });
        }
      }
      
      // Always use the first and last name from the form for the agent record
      if (firstName && lastName) {
        try {
          // If there's a userId but we didn't just create it above, update that user's name
          if (userId && !agentData.username) { // If username exists, we created the user above
            await storage.updateUser(userId, {
              firstName: firstName,
              lastName: lastName,
              fullName: `${firstName} ${lastName}`
            });
          }
          
          // Remove first/last name from agentData - these go in User table, not Agent table
          delete agentData.firstName;
          delete agentData.lastName;
        } catch (userError: any) {
          console.error("Error updating user data for agent:", userError);
          // Continue with agent creation even if user update fails
        }
      }
      
      // Set the userId for the agent (either from original data or newly created user)
      if (userId) {
        agentData.userId = userId;
      }
      
      const newAgent = await storage.createAgent(agentData);
      
      // For standard flow, also send a welcome email if email was provided
      if (agentData.email) {
        try {
          // Get the username and password from earlier in the function
          const { username, password, email } = agentData;
          
          // Send email in background to not block the response
          sendAgentWelcomeEmail({
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            username: username || '',
            temporaryPassword: password || '',
            email
          }).then(success => {
            if (success) {
              console.log(`Welcome email sent to ${firstName} ${lastName} (${email})`);
            } else {
              console.error(`Failed to send welcome email to ${email}`);
            }
          }).catch(err => {
            console.error('Error sending welcome email:', err);
          });
        } catch (emailError) {
          console.error('Error initiating welcome email for standard flow:', emailError);
          // Continue even if email sending fails
        }
      }
      
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
            let firstName = updateData.firstName;
            let lastName = updateData.lastName;
            
            // Get existing user data if we're only updating one of the name parts
            if ((firstName && !lastName) || (!firstName && lastName)) {
              const user = await storage.getUser(agent.userId);
              if (user) {
                firstName = firstName || user.firstName;
                lastName = lastName || user.lastName;
              }
            }
            
            if (firstName) userUpdateData.firstName = firstName;
            if (lastName) userUpdateData.lastName = lastName;
            
            // Only update fullName if we have both first and last name
            if (firstName && lastName) {
              userUpdateData.fullName = `${firstName} ${lastName}`;
            }
            
            await storage.updateUser(agent.userId, userUpdateData);
            
            // Remove first/last name from agentData to avoid duplication
            delete updateData.firstName;
            delete updateData.lastName;
          }
        } catch (userError: any) {
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
      // Clean input data - convert empty date strings to null
      const cleanedData = { ...req.body };
      if (cleanedData.dateOfBirth === "") {
        cleanedData.dateOfBirth = null;
      }
      
      const leadData = insertLeadSchema.parse(cleanedData);
      const newLead = await storage.createLead(leadData);
      
      // Also create a client record from the lead data
      const clientData = {
        name: `${newLead.firstName} ${newLead.lastName}`,
        email: newLead.email || `lead${newLead.id}@placeholder.com`, // Ensure email is not null
        phone: newLead.phoneNumber,
        address: newLead.address,
        sex: newLead.sex,
        status: "active",
        notes: newLead.notes,
        // Link to the lead and assigned agent
        assignedAgentId: newLead.assignedAgentId,
        leadId: newLead.id
      };
      
      // Create the client record
      try {
        const newClient = await storage.createClient(clientData);
        console.log(`Created client #${newClient.id} from lead #${newLead.id}`);
        
        // Add the client info to the response
        res.status(201).json({
          lead: newLead,
          client: newClient
        });
      } catch (clientError) {
        // If client creation fails, still return the lead but log the error
        console.error("Error creating client from lead:", clientError);
        res.status(201).json({
          lead: newLead,
          clientError: "Failed to create client record"
        });
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      handleValidationError(error, res);
    }
  });

  app.patch("/api/leads/:id", isAuthenticated, async (req, res) => {
    // Handle lead update logic with client synchronization
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // Get the lead first to check permissions
      const existingLead = await storage.getLead(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const userId = req.user?.id;
      const userRole = req.user?.role;

      // If user is not admin or team leader, we need to check if they're the assigned agent
      if (userRole !== 'admin' && userRole !== 'team_leader') {
        // Find the agent record for this user
        const agent = userId ? await storage.getAgentByUserId(userId) : null;
        
        // Debugging information
        console.log(`User ${userId} (role: ${userRole}) attempting to update lead ${id} via PATCH`);
        console.log(`Agent record:`, agent);
        console.log(`Lead assigned agent ID:`, existingLead.assignedAgentId);
        
        // If no agent record found or agent is not assigned to this lead, deny access
        if (!agent || (existingLead.assignedAgentId !== null && existingLead.assignedAgentId !== agent.id)) {
          console.log(`Access denied: User's agent ID (${agent?.id}) doesn't match assigned agent ID (${existingLead.assignedAgentId})`);
          return res.status(403).json({ message: "Access denied: You can only update leads assigned to you" });
        } else {
          console.log(`Access granted: User ${userId} is authorized to update lead ${id}`);
        }
      }

      // Clean input data - convert empty date strings to null
      const cleanedData = { ...req.body };
      if (cleanedData.dateOfBirth === "") {
        cleanedData.dateOfBirth = null;
      }

      const updateData = insertLeadSchema.partial().parse(cleanedData);
      const updatedLead = await storage.updateLead(id, updateData);
      
      // Synchronize lead changes to client if a client record exists for this lead
      if (updatedLead) {
        await syncLeadToClient(id, updatedLead, updateData);
      }
      
      res.json(updatedLead);
    } catch (error) {
      console.error("Error updating lead:", error);
      handleValidationError(error, res);
    }
  });
  
  // Support PUT method as well (clients are making PUT requests)
  app.put("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // Get the lead first to check permissions
      const existingLead = await storage.getLead(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const userId = req.user?.id;
      const userRole = req.user?.role;

      // If user is not admin or team leader, we need to check if they're the assigned agent
      if (userRole !== 'admin' && userRole !== 'team_leader') {
        // Find the agent record for this user
        const agent = userId ? await storage.getAgentByUserId(userId) : null;
        
        // Debugging information
        console.log(`User ${userId} (role: ${userRole}) attempting to update lead ${id}`);
        console.log(`Agent record:`, agent);
        console.log(`Lead assigned agent ID:`, existingLead.assignedAgentId);
        
        // If no agent record found or agent is not assigned to this lead, deny access
        if (!agent || (existingLead.assignedAgentId !== null && existingLead.assignedAgentId !== agent.id)) {
          console.log(`Access denied: User's agent ID (${agent?.id}) doesn't match assigned agent ID (${existingLead.assignedAgentId})`);
          return res.status(403).json({ message: "Access denied: You can only update leads assigned to you" });
        } else {
          console.log(`Access granted: User ${userId} is authorized to update lead ${id}`);
        }
      }

      // Clean input data - convert empty date strings to null
      const cleanedData = { ...req.body };
      if (cleanedData.dateOfBirth === "") {
        cleanedData.dateOfBirth = null;
      }

      const updateData = insertLeadSchema.partial().parse(cleanedData);
      const updatedLead = await storage.updateLead(id, updateData);
      
      // Synchronize lead changes to client if a client record exists for this lead
      if (updatedLead) {
        await syncLeadToClient(id, updatedLead, updateData);
      }
      
      res.json(updatedLead);
    } catch (error) {
      console.error("Error updating lead (PUT):", error);
      handleValidationError(error, res);
    }
  });

  app.delete("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lead ID" });
      }

      // First, get related policies
      const relatedPolicies = await storage.getPoliciesByLead(id);
      
      // Delete all related policies first
      if (relatedPolicies && relatedPolicies.length > 0) {
        console.log(`Deleting ${relatedPolicies.length} policies related to lead #${id}`);
        
        for (const policy of relatedPolicies) {
          await storage.deletePolicy(policy.id);
        }
      }
      
      // Now delete the lead
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

  // Allow agents to update their own profile information
  app.patch("/api/agents/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const agent = await storage.getAgentByUserId(req.user.id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent profile not found" });
      }
      
      // Handle username update if present
      if (req.body.username) {
        const newUsername = req.body.username;
        
        // Validate username format
        if (!/^[a-zA-Z0-9_.]+$/.test(newUsername)) {
          return res.status(400).json({ 
            message: "Username can only contain letters, numbers, underscores and periods" 
          });
        }
        
        // Check if username is already taken
        const existingUser = await storage.getUserByUsername(newUsername);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(400).json({ message: "Username already taken" });
        }
        
        // Update the username
        try {
          await storage.updateUser(req.user.id, { username: newUsername });
          console.log(`Username changed for user ${req.user.id} to ${newUsername}`);
          
          // Logout the user so they need to re-login with the new username
          // This is handled on the client side to allow the response to be sent
        } catch (usernameError) {
          console.error("Error updating username:", usernameError);
          return res.status(500).json({ message: "Failed to update username" });
        }
      }
      
      // Only allow updating specific fields that agents should be able to manage themselves
      const allowedFields = [
        "phoneNumber", 
        "address", 
        "city", 
        "state", 
        "zipCode", 
        "licensedStates", 
        "licenseNumber",
        "licenseExpiration",
        "npn"
      ];
      
      const updatedData: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updatedData[field] = req.body[field];
        }
      }
      
      // Update agent details if there are any agent-specific fields to update
      let updatedAgent = {...agent};
      if (Object.keys(updatedData).length > 0) {
        try {
          const result = await storage.updateAgent(agent.id, updatedData);
          
          if (result) {
            updatedAgent = result;
          } else {
            return res.status(500).json({ message: "Failed to update agent profile" });
          }
        } catch (error) {
          console.error("Error updating agent profile fields:", error);
          return res.status(500).json({ message: "Failed to update agent profile fields" });
        }
      }
      
      // Add the updated username to the response
      const responseData = {
        ...updatedAgent,
        username: req.body.username || req.user.username,
      };
      
      return res.json(responseData);
    } catch (error) {
      console.error("Error updating agent profile:", error);
      return res.status(500).json({ message: "Error updating agent profile" });
    }
  });
}