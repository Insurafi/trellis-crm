/**
 * This script synchronizes all existing policies with client records
 * It ensures that every policy is properly linked to the appropriate client
 */
import { storage } from './storage';
import { Policy } from '@shared/schema';
import { syncPolicyToClient } from './policy-client-sync';

export async function syncExistingPoliciesToClients() {
  console.log("Starting to synchronize existing policies to clients...");
  
  try {
    // Get all policies
    const policies = await storage.getPolicies();
    console.log(`Found ${policies.length} policies to process`);
    
    // Track progress
    let policiesWithClients = 0;
    let policiesWithLeads = 0;
    let policiesWithoutLinks = 0;
    let updatedPolicies = 0;
    let errors = 0;
    
    // Process each policy
    for (const policy of policies) {
      try {
        // Check if policy has a client association
        if (policy.clientId) {
          policiesWithClients++;
          
          // Ensure the client record exists
          const client = await storage.getClient(policy.clientId);
          if (client) {
            // The policy is already correctly linked to a client
            await syncPolicyToClient(policy.id, policy);
          } else {
            // The client doesn't exist - this policy has an invalid client reference
            console.warn(`Policy #${policy.id} references client #${policy.clientId} that doesn't exist`);
            
            // Try to find a client via the lead if possible
            if (policy.leadId) {
              const clientsWithLead = await storage.getClientsByLeadId(policy.leadId);
              if (clientsWithLead && clientsWithLead.length > 0) {
                const client = clientsWithLead[0];
                
                // Update the policy with the correct client ID
                const updatedPolicy = await storage.updatePolicy(policy.id, {
                  clientId: client.id
                });
                
                if (updatedPolicy) {
                  console.log(`Updated policy #${policy.id} to link with client #${client.id} via lead #${policy.leadId}`);
                  updatedPolicies++;
                }
              }
            }
          }
        } 
        // If no client ID, check if it has a lead association
        else if (policy.leadId) {
          policiesWithLeads++;
          
          // Try to find a client via the lead
          const clientsWithLead = await storage.getClientsByLeadId(policy.leadId);
          if (clientsWithLead && clientsWithLead.length > 0) {
            const client = clientsWithLead[0];
            
            // Update the policy with the client ID
            const updatedPolicy = await storage.updatePolicy(policy.id, {
              clientId: client.id
            });
            
            if (updatedPolicy) {
              console.log(`Updated policy #${policy.id} to link with client #${client.id} via lead #${policy.leadId}`);
              updatedPolicies++;
            }
          } else {
            console.log(`Policy #${policy.id} has lead #${policy.leadId} but no matching client was found`);
          }
        } 
        // No client or lead association
        else {
          policiesWithoutLinks++;
          console.log(`Policy #${policy.id} has no client or lead association`);
        }
      } catch (policyError) {
        console.error(`Error processing policy #${policy.id}:`, policyError);
        errors++;
      }
    }
    
    console.log("Policy sync complete:");
    console.log(`- ${policiesWithClients} policies already had client associations`);
    console.log(`- ${policiesWithLeads} policies had lead associations but no client`);
    console.log(`- ${policiesWithoutLinks} policies had no client or lead associations`);
    console.log(`- ${updatedPolicies} policies were updated with client associations`);
    console.log(`- ${errors} errors occurred during processing`);
  } catch (error) {
    console.error("Error synchronizing policies to clients:", error);
  }
}

// ESM modules don't have require.main
// Direct execution is handled by the npm script