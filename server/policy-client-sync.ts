/**
 * This file contains functions to handle synchronization between policies and clients
 */
import { storage } from './storage';
import { InsertPolicy, Policy } from '@shared/schema';

/**
 * Synchronize a newly created or updated policy with the associated client record
 * @param policyId The ID of the policy that was created or updated
 * @param policy The complete policy data
 * @param updateData The partial update data (for updates only)
 */
export async function syncPolicyToClient(
  policyId: number,
  policy: Policy,
  updateData?: Partial<InsertPolicy>
): Promise<void> {
  try {
    // Check if this policy is associated with a client
    const clientId = policy.clientId;
    
    if (!clientId) {
      // If no client ID is associated, check if this policy has a lead that's linked to a client
      if (policy.leadId) {
        const clientsWithLead = await storage.getClientsByLeadId(policy.leadId);
        
        if (clientsWithLead && clientsWithLead.length > 0) {
          // Found a client linked to the lead - update the policy with the client ID
          const client = clientsWithLead[0]; // Get the first match
          
          // Update the policy to include this client
          const policyUpdateResult = await storage.updatePolicy(policyId, {
            clientId: client.id
          });
          
          console.log(`Updated policy #${policyId} to associate with client #${client.id} via lead #${policy.leadId}`);
          
          // Now that the policy has a client ID, no further action needed in this case
          // The policy is already properly associated with the client
        }
      }
      
      // If we still have no client after checking leads, log and exit
      if (!clientId) {
        console.log(`Policy #${policyId} is not associated with a client (or via a lead). No client update needed.`);
        return;
      }
    }
    
    // Get the client record
    const client = await storage.getClient(clientId);
    
    if (!client) {
      console.warn(`Policy #${policyId} is associated with client #${clientId}, but client was not found.`);
      return;
    }
    
    // We've confirmed the client exists and is linked to this policy
    // No need to modify the client record directly as the relationship is maintained through the policy's clientId field
    
    // However, if there's additional client-specific data that should be updated based on policy changes,
    // we would implement that logic here
    
    // For example, if we wanted to update client status based on policy status:
    if (updateData && 'status' in updateData) {
      // This is just an example of what could be done - uncomment if needed
      /*
      const clientUpdateData = {
        // Map policy status to appropriate client status
        status: updateData.status === 'active' ? 'active' : 'pending'
      };
      
      await storage.updateClient(clientId, clientUpdateData);
      console.log(`Updated client #${clientId} status based on policy #${policyId} status change`);
      */
    }
    
    console.log(`Verified policy #${policyId} is properly linked to client #${clientId}`);
  } catch (error) {
    // Log but don't fail if client update fails
    console.error("Error synchronizing policy with client:", error);
  }
}

/**
 * Automatically associate a policy with the appropriate client
 * This is called when a new policy is created without a client ID
 * @param policy The newly created policy
 * @returns The updated policy with client association if one was found
 */
export async function associatePolicyWithClient(policy: Policy): Promise<Policy> {
  try {
    // If policy already has a client ID, no need to do anything
    if (policy.clientId) {
      return policy;
    }
    
    // If policy has a lead ID, try to find a client associated with that lead
    if (policy.leadId) {
      const clientsWithLead = await storage.getClientsByLeadId(policy.leadId);
      
      if (clientsWithLead && clientsWithLead.length > 0) {
        const client = clientsWithLead[0]; // Get the first match
        
        // Update the policy to include this client
        const updatedPolicy = await storage.updatePolicy(policy.id, {
          clientId: client.id
        });
        
        console.log(`Associated policy #${policy.id} with client #${client.id} via lead #${policy.leadId}`);
        
        return updatedPolicy || policy;
      }
    }
    
    return policy;
  } catch (error) {
    console.error("Error associating policy with client:", error);
    return policy;
  }
}