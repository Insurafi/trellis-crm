/**
 * This script creates test policies to verify our policy synchronization
 */
import { storage } from './storage';
import { syncPolicyToClient } from './policy-client-sync';

/**
 * Create test policies with various scenarios to verify synchronization
 */
async function createTestPolicies() {
  try {
    console.log("\n=== Starting Policy Sync Test ===\n");
    
    // First, get some agents, leads, and clients to work with
    const agents = await storage.getAgents();
    const leads = await storage.getLeads();
    const clients = await storage.getClients();
    
    console.log(`Found ${agents.length} agents, ${leads.length} leads, and ${clients.length} clients`);
    
    if (agents.length === 0 || leads.length === 0 || clients.length === 0) {
      console.log("Not enough data to proceed with test");
      return;
    }
    
    // Create test scenarios:
    // 1. Policy with a client directly linked
    // 2. Policy with a lead but no client (should auto-link)
    // 3. Policy with only an agent (neither client nor lead)
    
    const testResults = [];
    
    // Scenario 1: Policy with client directly linked
    console.log("\n--- Scenario 1: Creating policy with client directly linked ---");
    const client1 = clients[0];
    const agent1 = agents[0];
    
    const policy1 = await storage.createPolicy({
      policyNumber: `TEST-C-${Date.now()}`,
      carrier: "Test Insurance Co",
      policyType: "Term Life",
      status: "active",
      faceAmount: "250000.00",
      premium: "75.00",
      premiumFrequency: "monthly",
      applicationDate: new Date().toISOString().split('T')[0],
      clientId: client1.id,
      agentId: agent1.id,
    });
    
    console.log(`Created policy #${policy1.id} linked to client #${client1.id} and agent #${agent1.id}`);
    
    // Apply the synchronization
    await syncPolicyToClient(policy1.id, policy1);
    console.log("Applied policy synchronization");
    
    // Verify the policy is correctly linked
    const verifyPolicy1 = await storage.getPolicy(policy1.id);
    console.log(`Verification - Policy #${verifyPolicy1.id} client ID: ${verifyPolicy1.clientId}`);
    
    testResults.push({
      scenario: "Policy with client directly linked",
      policyId: policy1.id,
      clientId: verifyPolicy1.clientId,
      success: verifyPolicy1.clientId === client1.id
    });
    
    // Scenario 2: Policy with lead but no client (should auto-link)
    console.log("\n--- Scenario 2: Creating policy with lead but no client ---");
    
    // Find a lead that's associated with a client
    const leadWithClient = leads.find(lead => {
      return clients.some(client => client.leadId === lead.id);
    });
    
    if (leadWithClient) {
      const agent2 = agents.length > 1 ? agents[1] : agents[0];
      
      const policy2 = await storage.createPolicy({
        policyNumber: `TEST-L-${Date.now()}`,
        carrier: "Test Insurance Co",
        policyType: "Whole Life",
        status: "pending",
        faceAmount: "500000.00",
        premium: "250.00",
        premiumFrequency: "monthly",
        applicationDate: new Date().toISOString().split('T')[0],
        leadId: leadWithClient.id,
        agentId: agent2.id,
      });
      
      console.log(`Created policy #${policy2.id} linked to lead #${leadWithClient.id} and agent #${agent2.id}`);
      
      // Apply the synchronization (this should auto-link to the client)
      await syncPolicyToClient(policy2.id, policy2);
      console.log("Applied policy synchronization");
      
      // Verify the policy is now linked to a client
      const verifyPolicy2 = await storage.getPolicy(policy2.id);
      console.log(`Verification - Policy #${verifyPolicy2.id} client ID: ${verifyPolicy2.clientId}`);
      
      const linkedClient = verifyPolicy2.clientId 
        ? await storage.getClient(verifyPolicy2.clientId) 
        : null;
        
      console.log(`Linked to client: ${linkedClient ? `#${linkedClient.id} (${linkedClient.name})` : 'None'}`);
      
      testResults.push({
        scenario: "Policy with lead but no client (auto-link)",
        policyId: policy2.id,
        leadId: leadWithClient.id,
        clientId: verifyPolicy2.clientId,
        success: verifyPolicy2.clientId !== null && verifyPolicy2.clientId !== undefined
      });
    } else {
      console.log("No suitable lead found for scenario 2 testing");
      testResults.push({
        scenario: "Policy with lead but no client (auto-link)",
        skipped: true,
        reason: "No suitable lead found"
      });
    }
    
    // Scenario 3: Policy with only agent (no client or lead)
    console.log("\n--- Scenario 3: Creating policy with only agent ---");
    const agent3 = agents.length > 2 ? agents[2] : agents[0];
    
    const policy3 = await storage.createPolicy({
      policyNumber: `TEST-A-${Date.now()}`,
      carrier: "Test Insurance Co",
      policyType: "Universal Life",
      status: "applied",
      faceAmount: "750000.00",
      premium: "350.00",
      premiumFrequency: "monthly",
      applicationDate: new Date().toISOString().split('T')[0],
      agentId: agent3.id,
    });
    
    console.log(`Created policy #${policy3.id} linked only to agent #${agent3.id}`);
    
    // Apply the synchronization
    await syncPolicyToClient(policy3.id, policy3);
    console.log("Applied policy synchronization");
    
    // Verify the policy has no client linked (as expected)
    const verifyPolicy3 = await storage.getPolicy(policy3.id);
    console.log(`Verification - Policy #${verifyPolicy3.id} client ID: ${verifyPolicy3.clientId || 'None'}`);
    
    testResults.push({
      scenario: "Policy with only agent (no client or lead)",
      policyId: policy3.id,
      agentId: agent3.id,
      clientId: verifyPolicy3.clientId,
      success: verifyPolicy3.clientId === null || verifyPolicy3.clientId === undefined
    });
    
    // Print summary
    console.log("\n=== Test Results ===\n");
    testResults.forEach((result, index) => {
      if (result.skipped) {
        console.log(`Scenario ${index + 1}: ${result.scenario} - SKIPPED (${result.reason})`);
      } else {
        console.log(`Scenario ${index + 1}: ${result.scenario} - ${result.success ? 'SUCCESS' : 'FAILURE'}`);
        console.log(`  Policy #${result.policyId}, Client ID: ${result.clientId || 'None'}`);
      }
    });
    
    console.log("\n=== End of Policy Sync Test ===\n");
    
    // Verify all policies for all agents
    await verifyAllAgentPolicies();
    
  } catch (error) {
    console.error("Error in test policy creation:", error);
  }
}

/**
 * Verify that all policies are correctly associated with agents and visible in their accounts
 */
async function verifyAllAgentPolicies() {
  try {
    console.log("\n=== Verifying All Agent Policies ===\n");
    
    // Get all agents and their policies
    const agents = await storage.getAgents();
    
    for (const agent of agents) {
      // Get policies for this agent
      const policies = await storage.getPoliciesByAgent(agent.id);
      
      console.log(`Agent #${agent.id}: ${policies.length} policies`);
      
      for (const policy of policies) {
        const clientInfo = policy.clientId 
          ? `Client #${policy.clientId}` 
          : policy.leadId 
            ? `Lead #${policy.leadId}` 
            : "No client/lead";
            
        console.log(`  Policy #${policy.id}: ${policy.policyNumber} - ${policy.policyType} - ${clientInfo}`);
      }
    }
    
    console.log("\n=== End of Agent Policy Verification ===\n");
  } catch (error) {
    console.error("Error verifying agent policies:", error);
  }
}

// Execute the test
createTestPolicies()
  .then(() => {
    console.log("Test policy script completed");
  })
  .catch(error => {
    console.error("Test policy script failed:", error);
  });