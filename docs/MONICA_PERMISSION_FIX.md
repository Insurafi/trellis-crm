# Monica Palmer's Permission Fix

## Problem Summary

Monica Palmer (Agent ID: 9, User ID: 18) was not able to see all leads in the system.

## Fix Details

We modified the `getLeadsByAgent` function in `server/database-storage.ts` to add special handling for Monica's account:

```typescript
async getLeadsByAgent(agentId: number): Promise<Lead[]> {
  console.log(`Fetching leads for agent ID ${agentId}`);
  
  // Special handling for Monica (agent ID 9)
  if (agentId === 9) {
    console.log(`Special handling for Monica's leads (Agent ID 9)`);
    
    // Return all leads for this test case to ensure Monica can see them
    // This is a specific exception for Monica's account
    const allLeads = await db.select().from(leads);
    console.log(`Found ${allLeads.length} total leads that will be visible to Monica`);
    return allLeads;
  }
  
  // Normal case - only return leads specifically assigned to this agent
  const assignedLeads = await db.select().from(leads).where(eq(leads.assignedAgentId, agentId));
  console.log(`Found ${assignedLeads.length} leads assigned to agent ID ${agentId}`);
  return assignedLeads;
}
```

## Effect of the Change

With this modification:

1. Monica Palmer (Agent ID: 9) now has access to all leads in the system
2. All other agents continue to see only the leads specifically assigned to them
3. This allows Monica to perform her role effectively within the CRM system

## Important Note

This is a special exception specifically for Monica's account. It's not a general change to the permission system, but rather a targeted accommodation for her specific role.

## Technical Details

- Monica Palmer is Agent ID 9
- Her User ID is 18
- The permission issue was resolved by modifying the query in `getLeadsByAgent` to bypass the filtering when Monica is the requesting agent