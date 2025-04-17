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
      
      // Always sync the full name when any part of the name is updated
      if (updatedLead.firstName || updatedLead.lastName) {
        clientUpdateData.name = `${updatedLead.firstName || ''} ${updatedLead.lastName || ''}`.trim().toUpperCase();
      }
      
      // Map all possible lead fields to their client equivalents
      
      // Contact information
      if ('email' in updateData) {
        // Ensure email is not null (it's required by the schema)
        clientUpdateData.email = updateData.email || `lead${updatedLead.id}@placeholder.com`;
      }
      
      if ('phoneNumber' in updateData) {
        clientUpdateData.phone = updateData.phoneNumber;
      }
      
      // Address information
      if ('address' in updateData) {
        clientUpdateData.address = updateData.address;
      }
      
      if ('city' in updateData) {
        clientUpdateData.city = updateData.city;
      }
      
      if ('state' in updateData) {
        clientUpdateData.state = updateData.state;
      }
      
      if ('zipCode' in updateData) {
        clientUpdateData.zipCode = updateData.zipCode;
      }
      
      // Personal information
      if ('sex' in updateData) {
        clientUpdateData.sex = updateData.sex;
      }
      
      if ('dateOfBirth' in updateData) {
        clientUpdateData.dateOfBirth = updateData.dateOfBirth;
      }
      
      // Financial/insurance information
      if ('existingCoverage' in updateData) {
        clientUpdateData.insuranceInfo = updateData.existingCoverage;
      }
      
      if ('insuranceTypeInterest' in updateData) {
        clientUpdateData.insuranceType = updateData.insuranceTypeInterest;
      }
      
      // Tracking information
      if ('notes' in updateData) {
        clientUpdateData.notes = updateData.notes;
      }
      
      if ('assignedAgentId' in updateData) {
        clientUpdateData.assignedAgentId = updateData.assignedAgentId;
      }
      
      if ('status' in updateData) {
        // Map lead status to client status (if client has a status field)
        clientUpdateData.status = updateData.status;
      }
      
      // Only update if there are changes to make
      if (Object.keys(clientUpdateData).length > 0) {
        const updatedClient = await storage.updateClient(client.id, clientUpdateData);
        console.log(`Updated client #${client.id} from lead #${leadId} with fields: ${Object.keys(clientUpdateData).join(', ')}`);
      }
    } else {
      // No client found for this lead - this should not happen with the current implementation
      // but we log it for monitoring
      console.warn(`Lead #${leadId} was updated but no client record was found to sync with.`);
    }
  } catch (error) {
    // Log but don't fail if client update fails
    console.error("Error updating client from lead:", error);
  }
}