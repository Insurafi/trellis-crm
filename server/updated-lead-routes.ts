/**
 * Updated lead routes that include client synchronization
 * Replace the existing routes in routes-agents-leads-policies.ts with these ones
 */

// PATCH endpoint - used by client code
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
      const agent = await storage.getAgentByUserId(userId);
      
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
    await syncLeadToClient(id, updatedLead, updateData);
    
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
      const agent = await storage.getAgentByUserId(userId);
      
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
    await syncLeadToClient(id, updatedLead, updateData);
    
    res.json(updatedLead);
  } catch (error) {
    console.error("Error updating lead (PUT):", error);
    handleValidationError(error, res);
  }
});