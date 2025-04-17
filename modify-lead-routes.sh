#!/bin/bash
# A script to modify the lead routes to add client synchronization

# For the PATCH endpoint
sed -i '659a\      // Synchronize lead changes to client if a client record exists for this lead\n      await syncLeadToClient(id, updatedLead, updateData);' server/routes-agents-leads-policies.ts

# For the PUT endpoint
sed -i '711a\      // Synchronize lead changes to client if a client record exists for this lead\n      await syncLeadToClient(id, updatedLead, updateData);' server/routes-agents-leads-policies.ts

echo "Updated both PATCH and PUT endpoints"