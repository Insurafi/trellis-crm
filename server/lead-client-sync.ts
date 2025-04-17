/**
 * This file contains functions to handle synchronization between leads and clients
 */
import { storage } from './storage';
import { InsertLead, Lead } from '@shared/schema';

/**
 * Update the client record associated with a lead when the lead is updated
 * @param leadId The ID of the lead that was updated
 * @param updatedLead The updated lead data
 * @param updateData The partial update data that was applied to the lead
 */
export async function syncLeadToClient(
  leadId: number, 
  updatedLead: Lead, 
  updateData: Partial<InsertLead>
): Promise<void> {
  try {
    // Find if there's a client record linked to this lead
    const clientsWithLead = await storage.getClientsByLeadId(leadId);
    
    if (clientsWithLead && clientsWithLead.length > 0) {
      const client = clientsWithLead[0]; // Get the first match
      
      // Update client data based on lead changes
      const clientUpdateData: any = {};
      
      // Map lead fields to client fields that should be synchronized
      if (updatedLead.firstName || updatedLead.lastName) {
        clientUpdateData.name = `${updatedLead.firstName || ''} ${updatedLead.lastName || ''}`.trim();
      }
      if (updateData.email !== undefined) {
        // Ensure email is not null (it's required by the schema)
        clientUpdateData.email = updateData.email || `lead${updatedLead.id}@placeholder.com`;
      }
      if (updateData.phoneNumber !== undefined) clientUpdateData.phone = updateData.phoneNumber;
      if (updateData.address !== undefined) clientUpdateData.address = updateData.address;
      if (updateData.sex !== undefined) clientUpdateData.sex = updateData.sex;
      if (updateData.notes !== undefined) clientUpdateData.notes = updateData.notes;
      if (updateData.assignedAgentId !== undefined) clientUpdateData.assignedAgentId = updateData.assignedAgentId;
      
      // Only update if there are changes to make
      if (Object.keys(clientUpdateData).length > 0) {
        const updatedClient = await storage.updateClient(client.id, clientUpdateData);
        console.log(`Updated client #${client.id} from lead #${leadId}`);
      }
    }
  } catch (error) {
    // Log but don't fail if client update fails
    console.error("Error updating client from lead:", error);
  }
}