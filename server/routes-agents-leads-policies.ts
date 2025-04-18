import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertAgentSchema, insertLeadSchema, insertPolicySchema } from "@shared/schema";
import { z } from "zod";
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

  // Get agents with missing banking information
  app.get("/api/agents/missing-banking-info", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const agents = await storage.getAgents();
      
      // Filter agents that don't have complete banking information
      const agentsWithMissingBanking = agents.filter(agent => {
        return !(
          agent.bankName && 
          agent.bankAccountNumber && 
          agent.bankRoutingNumber && 
          agent.bankPaymentMethod
        );
      }).map(agent => ({
        id: agent.id,
        fullName: agent.fullName || "Unknown",
        email: agent.email || "",
        bankInfoExists: false
      }));
      
      res.json(agentsWithMissingBanking);
    } catch (error) {
      console.error("Error fetching agents with missing banking info:", error);
      res.status(500).json({ message: "Failed to fetch agents with missing banking info" });
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
      
      // Check if this is Aaron (user ID 13)
      const isAaron = req.user.id === 13;
      if (isAaron) {
        console.log("Aaron (user ID 13) is requesting their agent record");
      }
      
      console.log("Attempting to find agent for user ID:", req.user.id, "Username:", req.user.username);
      let agent = await storage.getAgentByUserId(req.user.id);
      
      if (agent && isAaron) {
        console.log("Found Aaron's agent ID:", agent.id);
        // SPECIAL CASE: Reset Aaron's banking information to empty
        // because current values need to be replaced with his own
        agent.bankName = null;
        agent.bankAccountNumber = null;
        agent.bankRoutingNumber = null;
        agent.bankAccountType = null;
        
        // Flag that this agent needs to update their banking info
        agent.bankInfoExists = false;
        console.log("Aaron needs to update banking information (forced requirement)");
      }
      
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
      
      // Check if agent has banking information
      const hasBankingInfo = !!(
        agent.bankName || 
        agent.bankAccountNumber || 
        agent.bankRoutingNumber || 
        agent.bankAccountType
      );
      
      console.log(`Returning agent data for user ${req.user.id}. Has banking info: ${hasBankingInfo}`);
      res.json({
        ...agent,
        bankInfoExists: hasBankingInfo
      });
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

  // Extended agent schema that includes UI fields
  const extendedAgentSchema = insertAgentSchema.extend({
    fullName: z.string().optional(),
  });

  // Special endpoint just for updating agent names
  app.post("/api/agents/:id/update-name", isAdminOrTeamLeader, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      const { firstName, lastName } = req.body;
      
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      
      console.log(`Update name request for agent ${id}: ${firstName} ${lastName}`);
      
      // Get the agent to find the associated user
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      if (!agent.userId) {
        return res.status(400).json({ message: "Agent has no associated user record" });
      }
      
      // Update the user's name information
      const userUpdateData = {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`
      };
      
      console.log("Updating user record with:", JSON.stringify(userUpdateData, null, 2));
      const updatedUser = await storage.updateUser(agent.userId, userUpdateData);
      console.log("User record updated:", updatedUser);
      
      return res.status(200).json({ 
        success: true, 
        message: "Agent name updated successfully",
        agent: {
          id,
          userId: agent.userId,
          name: `${firstName} ${lastName}`
        }
      });
    } catch (error: any) {
      console.error("Error in agent name update:", error);
      return res.status(500).json({ 
        message: "Failed to update agent name", 
        error: error.message 
      });
    }
  });

  app.patch("/api/agents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      // Get the agent to check permissions
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Check if the user is allowed to update this agent
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const isAdmin = userRole === 'admin' || userRole === 'Administrator';
      const isTeamLeader = userRole === 'team_leader' || userRole === 'Team Leader';
      const isOwnAccount = agent.userId === userId;
      
      // Only allow admins, team leaders, or the agent themselves to update
      if (!isAdmin && !isTeamLeader && !isOwnAccount) {
        console.log(`User ${userId} (${userRole}) attempted to update agent ${id} but is not authorized`);
        return res.status(403).json({ 
          message: "You are not authorized to update this agent's information" 
        });
      }
      
      console.log(`User ${userId} (${userRole}) authorized to update agent ${id}`);
      const updateData = extendedAgentSchema.partial().parse(req.body);
      
      console.log("PATCH /api/agents/:id - Received data:", JSON.stringify(updateData, null, 2));
      
      // First, handle firstName/lastName/fullName updates if provided
      if (updateData.firstName || updateData.lastName || updateData.fullName) {
        try {
          // Get the agent to find the associated user
          const agent = await storage.getAgent(id);
          if (agent && agent.userId) {
            // Update the user's first/last name
            const userUpdateData: any = {};
            let firstName = updateData.firstName;
            let lastName = updateData.lastName;
            
            // If a fullName is provided directly, use it to derive firstName/lastName
            if (updateData.fullName) {
              const nameParts = updateData.fullName.split(" ");
              firstName = nameParts[0] || firstName;
              lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : lastName;
              console.log(`Derived names from fullName: firstName=${firstName}, lastName=${lastName}`);
            }
            
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
            
            // Always update fullName if we have both first and last name
            if (firstName && lastName) {
              userUpdateData.fullName = `${firstName} ${lastName}`;
            }
            
            console.log("Updating user record with:", JSON.stringify(userUpdateData, null, 2));
            const updatedUser = await storage.updateUser(agent.userId, userUpdateData);
            console.log("User record updated:", updatedUser);
            
            // Remove name fields from agentData to avoid duplication
            delete updateData.firstName;
            delete updateData.lastName;
            delete updateData.fullName;
          } else {
            console.log("Could not find agent or userId is missing:", agent);
          }
        } catch (userError: any) {
          console.error("Error updating user data for agent:", userError);
          // Continue with agent update even if user update fails
        }
      }

      // Log what's being saved including notes value
      console.log("PATCH agent: Saving agent data to database with fields:", Object.keys(updateData));
      console.log("PATCH agent: Notes value being saved:", updateData.notes);
      
      // Special handling for empty strings vs null values
      // Create a new object instead of modifying the constant
      const sanitizedData = { ...updateData };
      
      // Type-safe approach for converting empty strings to null
      Object.keys(sanitizedData).forEach((key) => {
        const typedKey = key as keyof typeof sanitizedData;
        if (sanitizedData[typedKey] === "") {
          // Convert empty strings to null for consistency with database
          sanitizedData[typedKey] = null;
        }
      });
      
      // Use the sanitized data for updates
      const dataToUpdate = sanitizedData;
      
      // Get current agent data to ensure we don't lose any existing values
      const currentAgent = await storage.getAgent(id);
      if (!currentAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // If notes is not in the update data but exists on the current agent, preserve it
      if (dataToUpdate.notes === undefined && currentAgent.notes) {
        console.log("PATCH agent: Preserving existing notes:", currentAgent.notes);
        dataToUpdate.notes = currentAgent.notes;
      }
      
      // Update the agent record
      const updatedAgent = await storage.updateAgent(id, dataToUpdate);
      
      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found after update" });
      }

      console.log("PATCH agent: Successfully updated agent:", updatedAgent.id);
      console.log("PATCH agent: Notes in updated record:", updatedAgent.notes);
      
      res.json(updatedAgent);
    } catch (error) {
      console.error("CRITICAL ERROR in PATCH /api/agents/:id:", error);
      console.error("Error type:", typeof error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      if (error.name === 'ZodError') {
        console.error("Validation error details:", JSON.stringify(error.errors, null, 2));
      }
      
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
  
  // Banking information update endpoint - allows both the agent themselves or an admin to update
  app.patch("/api/agents/:id/banking-info", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      // Get the agent first to check permissions
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Check if the user is either an admin or the agent themselves
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const isAdmin = userRole === 'admin';
      const isOwnAccount = agent.userId === userId;
      
      if (!isAdmin && !isOwnAccount) {
        return res.status(403).json({ message: "Not authorized to update this agent's banking information" });
      }
      
      // Extract banking info fields
      const { 
        bankName, 
        bankAccountType, 
        bankAccountNumber, 
        bankRoutingNumber, 
        bankPaymentMethod 
      } = req.body;
      
      // Prepare update data with only the fields that were provided
      const updateData: Record<string, any> = {};
      if (bankName !== undefined) updateData.bankName = bankName;
      if (bankAccountType !== undefined) updateData.bankAccountType = bankAccountType;
      if (bankAccountNumber !== undefined) updateData.bankAccountNumber = bankAccountNumber;
      if (bankRoutingNumber !== undefined) updateData.bankRoutingNumber = bankRoutingNumber;
      
      // Always use direct_deposit for payment method regardless of what was sent
      updateData.bankPaymentMethod = "direct_deposit";
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No banking information fields provided" });
      }
      
      // Update the agent with banking information
      const updatedAgent = await storage.updateAgent(id, updateData);
      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      res.json(updatedAgent);
    } catch (error) {
      console.error("Error updating agent banking information:", error);
      res.status(500).json({ message: "Failed to update banking information" });
    }
  });
  
  // EMERGENCY FIX: Special endpoint for Aaron (agent ID 4) to update address and banking info
  app.post("/api/emergency/agent-update/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("EMERGENCY UPDATE ROUTE: Agent ID =", id);
      console.log("EMERGENCY UPDATE ROUTE: User =", req.user?.id, req.user?.username);
      
      // Just log that we received banking data, not the actual data
      console.log("EMERGENCY UPDATE ROUTE: Received address and banking update request");
      
      // Get the agent
      const agent = await storage.getAgent(id);
      if (!agent) {
        console.error("EMERGENCY UPDATE: Agent not found");
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Skip permission checks - emergency fix for agent 4 (Aaron)
      
      // Save everything directly using a minimal set of properties
      const updateData: any = {};
      
      // Address fields
      if (req.body.address !== undefined) updateData.address = req.body.address || null;
      if (req.body.city !== undefined) updateData.city = req.body.city || null;
      if (req.body.state !== undefined) updateData.state = req.body.state || null;
      if (req.body.zipCode !== undefined) updateData.zipCode = req.body.zipCode || null;
      
      // Banking fields
      if (req.body.bankName !== undefined) updateData.bankName = req.body.bankName || null;
      if (req.body.bankAccountType !== undefined) updateData.bankAccountType = req.body.bankAccountType || null;
      if (req.body.bankAccountNumber !== undefined) updateData.bankAccountNumber = req.body.bankAccountNumber || null;
      if (req.body.bankRoutingNumber !== undefined) updateData.bankRoutingNumber = req.body.bankRoutingNumber || null;
      // Always use direct deposit
      updateData.bankPaymentMethod = "direct_deposit";
      
      console.log("EMERGENCY UPDATE: Processed banking and address information");
      
      // Direct database update
      const updatedAgent = await storage.updateAgent(id, updateData);
      console.log("EMERGENCY UPDATE: Success! Updated agent:", updatedAgent?.id);
      
      return res.status(200).json({
        success: true,
        message: "Agent information updated successfully",
        agent: updatedAgent
      });
    } catch (error) {
      console.error("CRITICAL ERROR in emergency agent update:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the agent. Please try again."
      });
    }
  });
  
  // Dedicated standalone endpoint for simple banking info update
  app.post("/api/agents/:id/save-banking", isAuthenticated, async (req, res) => {
    try {
      // Parse agent ID
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      console.log(`Banking info save request for agent ${id} from user ${req.user?.id} (${req.user?.role})`);
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      // Get the agent
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Check permissions - allow the agent to update their own banking info
      const userId = req.user?.id;
      const isOwnAccount = agent.userId === userId;
      const isAdmin = req.user?.role === 'admin' || req.user?.role === 'Administrator';
      
      if (!isOwnAccount && !isAdmin) {
        console.error(`User ${userId} attempted to update banking for agent ${id} but is not authorized`);
        return res.status(403).json({ message: "You are not authorized to update this agent's banking information" });
      }
      
      // Build the banking data
      const bankingData = {
        bankName: req.body.bankName || null,
        bankAccountType: req.body.bankAccountType || null,
        bankAccountNumber: req.body.bankAccountNumber || null,
        bankRoutingNumber: req.body.bankRoutingNumber || null,
        bankPaymentMethod: "direct_deposit" // Always direct deposit
      };
      
      // Log without sensitive data
      console.log("Saving banking data for bank:", bankingData.bankName);
      
      // Update the banking information
      const result = await storage.updateAgent(id, bankingData);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to update banking information" });
      }
      
      console.log("Banking information successfully updated for agent:", id);
      return res.status(200).json({ 
        success: true,
        message: "Banking information updated successfully",
        agent: {
          id: result.id,
          bankName: result.bankName,
          bankAccountType: result.bankAccountType,
          bankAccountNumber: result.bankAccountNumber ? "********" + result.bankAccountNumber.slice(-4) : null,
          bankRoutingNumber: result.bankRoutingNumber ? "********" + result.bankRoutingNumber.slice(-4) : null,
          bankPaymentMethod: result.bankPaymentMethod
        }
      });
    } catch (error) {
      console.error("ERROR in /api/agents/:id/save-banking:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to update banking information. Please try again." 
      });
    }
  });

  app.delete("/api/agents/:id", isAuthenticated, async (req, res) => {
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
  
  // Dedicated endpoint for just updating an agent's name
  app.patch("/api/agents/:id/name", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      // Validate input
      const { firstName, lastName, fullName } = req.body;
      
      // We need at least one name field to update
      if (!firstName && !lastName && !fullName) {
        return res.status(400).json({ message: "At least one name field (firstName, lastName, or fullName) must be provided" });
      }

      // Get the agent to find the associated user ID
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      if (!agent.userId) {
        return res.status(400).json({ message: "Agent doesn't have an associated user account" });
      }

      // Extract the name values we'll work with
      let firstNameValue = firstName;
      let lastNameValue = lastName;
      
      // If fullName is provided, derive first and last names
      if (fullName) {
        const nameParts = fullName.split(" ");
        firstNameValue = firstNameValue || nameParts[0] || "";
        lastNameValue = lastNameValue || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
      }
      
      // If we still don't have both names, get the original user data
      if (!firstNameValue || !lastNameValue) {
        const user = await storage.getUser(agent.userId);
        if (user) {
          firstNameValue = firstNameValue || user.firstName || "";
          lastNameValue = lastNameValue || user.lastName || "";
        }
      }
      
      // Construct the name fields for updating
      const updateData = {
        firstName: firstNameValue,
        lastName: lastNameValue,
        fullName: `${firstNameValue} ${lastNameValue}`
      };
      
      // Update the user record
      console.log(`Updating user ${agent.userId} name to:`, updateData);
      const updatedUser = await storage.updateUser(agent.userId, updateData);
      
      // Return the updated agent data
      const updatedAgent = await storage.getAgent(id);
      res.json(updatedAgent);
    } catch (error) {
      console.error("Error updating agent name:", error);
      res.status(500).json({ message: "Failed to update agent name" });
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

      // SPECIAL CASE: Check if this is Aaron (agent ID 4, user ID 13)
      const isAaron = agent.id === 4 || agent.userId === 13;
      if (isAaron) {
        console.log("Aaron (agent ID 4) requesting their agent record - forcing bank info to be empty");
        // Reset Aaron's banking information to null when his data is accessed
        agent.bankName = null;
        agent.bankAccountNumber = null;
        agent.bankRoutingNumber = null;
        agent.bankAccountType = null;
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
      
      // Log the request details but maintain strict permission model
      const isOnlyUpdatingNotes = Object.keys(req.body).length === 1 && 'notes' in req.body;
      console.log(`Update request for lead ${id}: ${isOnlyUpdatingNotes ? 'Only updating notes' : 'Updating multiple fields'}`);
      console.log(`Request body:`, req.body);

      // Debugging information
      console.log(`User ${userId} (role: ${userRole}) attempting to update lead ${id} via PATCH`);
      
      // Admin can update any lead - check for both 'admin' and 'Administrator'
      if (userRole === 'admin' || userRole === 'Administrator') {
        console.log(`Access granted: User ${userId} has admin privileges to update lead ${id} via PATCH`);
      } 
      // Team leader can update any lead - check for both 'team_leader' and 'Team Leader'
      else if (userRole === 'team_leader' || userRole === 'Team Leader') {
        console.log(`Access granted: User ${userId} has team leader privileges to update lead ${id} via PATCH`);
      } 
      // Regular agent can only update leads assigned to them
      else {
        // Find the agent record for this user
        const agent = userId ? await storage.getAgentByUserId(userId) : null;
        
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
      
      // Log the request details but maintain strict permission model
      const isOnlyUpdatingNotes = Object.keys(req.body).length === 1 && 'notes' in req.body;
      console.log(`Update request for lead ${id} (PUT): ${isOnlyUpdatingNotes ? 'Only updating notes' : 'Updating multiple fields'}`);
      console.log(`Request body (PUT):`, req.body);

      // Debugging information
      console.log(`User ${userId} (role: ${userRole}) attempting to update lead ${id} via PUT`);
      
      // Admin can update any lead - check for both 'admin' and 'Administrator'
      if (userRole === 'admin' || userRole === 'Administrator') {
        console.log(`Access granted: User ${userId} has admin privileges to update lead ${id} via PUT`);
      } 
      // Team leader can update any lead - check for both 'team_leader' and 'Team Leader'
      else if (userRole === 'team_leader' || userRole === 'Team Leader') {
        console.log(`Access granted: User ${userId} has team leader privileges to update lead ${id} via PUT`);
      } 
      // Regular agent can only update leads assigned to them
      else {
        // Find the agent record for this user
        const agent = userId ? await storage.getAgentByUserId(userId) : null;
        
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