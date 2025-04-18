import { storage } from './server/storage';
import { db } from './server/db';
import { policies } from './shared/schema';
import { eq } from 'drizzle-orm';

async function cleanUpAaronData() {
  try {
    console.log('=== CLEANING UP AARON DATA ===');
    
    // Get Aaron's policies
    const aaronPolicies = await storage.getPoliciesByAgent(4);
    console.log(`Found ${aaronPolicies.length} policies for Aaron (Agent #4):`);
    
    // Reassign to Agent #3 (Tremaine Taylor)
    const newAgentId = 3;
    
    for (const policy of aaronPolicies) {
      console.log(`Reassigning policy #${policy.id} (${policy.policyNumber}) from Aaron to Agent #${newAgentId}...`);
      
      // Update the policy to reassign to the other agent
      await db.update(policies)
        .set({ 
          agentId: newAgentId
        })
        .where(eq(policies.id, policy.id));
      
      console.log(`✅ Policy #${policy.id} reassigned from Aaron to Agent #${newAgentId}`);
    }
    
    console.log('\nVerifying that policies were removed from Aaron:');
    const verifyPolicies = await storage.getPoliciesByAgent(4);
    console.log(`Aaron now has ${verifyPolicies.length} policies`);
    
    console.log('\nVerifying client association:');
    const clients = await storage.getClientsByAgent(4);
    console.log(`Aaron now has ${clients.length} clients`);
    
    console.log('\n=== CLEANUP COMPLETE ===');
  } catch (error) {
    console.error('Error cleaning up Aaron data:', error);
  }
}

cleanUpAaronData();
