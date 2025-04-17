/**
 * One-time utility to create client records for existing leads
 */
import { storage } from './storage';

export async function syncExistingLeadsToClients(): Promise<void> {
  try {
    console.log("Starting to synchronize existing leads to clients...");
    
    // Get all leads
    const leads = await storage.getLeads();
    console.log(`Found ${leads.length} leads to process`);
    
    // Get all existing clients with lead IDs
    const clients = await storage.getClients();
    const clientLeadIds = clients
      .filter(client => client.leadId !== null && client.leadId !== undefined)
      .map(client => client.leadId);
    
    console.log(`Found ${clientLeadIds.length} leads that already have client records`);
    
    // Process leads that don't have client records yet
    let createdCount = 0;
    let errorCount = 0;
    
    for (const lead of leads) {
      // Skip if this lead already has a client record
      if (clientLeadIds.includes(lead.id)) {
        continue;
      }
      
      try {
        // Create a client record for this lead
        const clientData = {
          name: `${lead.firstName} ${lead.lastName}`,
          email: lead.email || `lead${lead.id}@placeholder.com`, // Ensure email is not null
          phone: lead.phoneNumber,
          address: lead.address,
          sex: lead.sex,
          status: "active",
          notes: lead.notes,
          // Link to the lead and assigned agent
          assignedAgentId: lead.assignedAgentId,
          leadId: lead.id
        };
        
        const newClient = await storage.createClient(clientData);
        console.log(`Created client #${newClient.id} from lead #${lead.id}`);
        createdCount++;
      } catch (error) {
        console.error(`Error creating client from lead #${lead.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Sync complete: Created ${createdCount} new client records with ${errorCount} errors`);
  } catch (error) {
    console.error("Error synchronizing leads to clients:", error);
  }
}