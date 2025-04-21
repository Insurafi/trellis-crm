/**
 * One-time script to update client date_of_birth from associated lead data
 */
import { db } from '../server/db';
import { storage } from '../server/storage';
import { clients, leads } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function updateClientDateOfBirth() {
  try {
    console.log("Starting to update client date_of_birth from leads...");
    
    // Get all clients with lead IDs (using storage interface)
    const allClients = await storage.getClients();
    const clientsWithLeadIds = allClients.filter(client => client.leadId !== null);
    
    console.log(`Found ${clientsWithLeadIds.length} clients with associated leads`);
    
    let updatedCount = 0;
    let noLeadDataCount = 0;
    let errorCount = 0;
    
    // Process each client
    for (const client of clientsWithLeadIds) {
      try {
        // Skip if client already has date_of_birth
        if (client.dateOfBirth !== null) {
          console.log(`Client #${client.id} already has date_of_birth, skipping`);
          continue;
        }
        
        // Get the lead record using the storage interface
        const lead = await db.select().from(leads).where(eq(leads.id, client.leadId!)).limit(1);
        
        if (!lead || lead.length === 0) {
          console.log(`No lead found for client #${client.id} (leadId: ${client.leadId})`);
          noLeadDataCount++;
          continue;
        }
        
        const leadRecord = lead[0];
        
        // Skip if lead doesn't have date_of_birth
        if (!leadRecord.dateOfBirth) {
          console.log(`Lead #${leadRecord.id} doesn't have date_of_birth for client #${client.id}`);
          noLeadDataCount++;
          continue;
        }
        
        // Update client with lead's date_of_birth
        await db.update(clients)
          .set({ dateOfBirth: leadRecord.dateOfBirth })
          .where(eq(clients.id, client.id));
        
        console.log(`Updated client #${client.id} with date_of_birth from lead #${leadRecord.id}: ${leadRecord.dateOfBirth}`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating client #${client.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`
Update complete:
- ${updatedCount} clients updated with date_of_birth
- ${noLeadDataCount} clients skipped (no lead data or lead without date_of_birth)
- ${errorCount} errors encountered
    `);
  } catch (error) {
    console.error("Error in updateClientDateOfBirth:", error);
  }
}

// Run the script
updateClientDateOfBirth().catch(console.error);