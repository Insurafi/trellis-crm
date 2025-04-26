# Trellis CRM: Lead-to-Client Conversion Fix

## Problem Summary

There were three mechanisms automatically converting leads to clients:

1. In `server/routes-agents-leads-policies.ts` - Creating a client record for every new lead
2. In `server/sync-existing-leads-to-clients.ts` - Running at server startup to convert existing leads
3. In `server/lead-client-sync.ts` - Syncing lead changes to client records

## Solution: Disable All Three Sync Mechanisms

### 1. Fixed POST /api/leads Endpoint

The POST endpoint was automatically creating client records whenever a new lead was created:

```typescript
// BEFORE: In routes-agents-leads-policies.ts
app.post("/api/leads", isAuthenticated, async (req, res) => {
  try {
    const leadData = insertLeadSchema.parse(req.body);
    const lead = await storage.createLead(leadData);
    
    // REMOVED: This code was automatically creating a client from the lead
    // Create a corresponding client record
    const clientData = {
      name: `${lead.firstName} ${lead.lastName}`.toUpperCase(),
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email || `lead${lead.id}@placeholder.com`,
      phone: lead.phoneNumber,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zipCode: lead.zipCode,
      dateOfBirth: lead.dateOfBirth,
      status: "active",
      assignedAgentId: lead.assignedAgentId,
      leadId: lead.id
    };
    
    const client = await storage.createClient(clientData);
    
    res.status(201).json(lead);
  } catch (error) {
    handleValidationError(error, res);
  }
});

// AFTER: In routes-agents-leads-policies.ts - Fixed Version
app.post("/api/leads", isAuthenticated, async (req, res) => {
  try {
    const leadData = insertLeadSchema.parse(req.body);
    const lead = await storage.createLead(leadData);
    
    // No automatic client creation - just return the lead
    res.status(201).json(lead);
  } catch (error) {
    handleValidationError(error, res);
  }
});
```

### 2. Disabled Sync at Server Startup

The code in `server/index.ts` and `server/routes.ts` that was calling the sync-existing-leads-to-clients function on startup:

```typescript
// BEFORE: In server/index.ts or server/routes.ts
import { syncExistingLeadsToClients } from './sync-existing-leads-to-clients';

// Later in the code:
// This line was automatically converting leads to clients at startup
syncExistingLeadsToClients();

// AFTER: Commented out this call to prevent automatic conversion
// syncExistingLeadsToClients();
```

### 3. Modified Lead-Client Sync Mechanism

The lead-client sync was still being imported but the actual function calls were disabled in the route handlers:

```typescript
// BEFORE: In routes-agents-leads-policies.ts (in the PATCH /api/leads/:id endpoint)
app.patch("/api/leads/:id", isAuthenticated, async (req, res) => {
  try {
    // ... code to validate and update the lead
    
    // This line was syncing lead changes to client records
    await syncLeadToClient(leadId, updatedLead, req.body);
    
    res.json(updatedLead);
  } catch (error) {
    handleValidationError(error, res);
  }
});

// AFTER: In routes-agents-leads-policies.ts - Fixed Version
app.patch("/api/leads/:id", isAuthenticated, async (req, res) => {
  try {
    // ... code to validate and update the lead
    
    // Commented out this line to prevent auto-sync
    // await syncLeadToClient(leadId, updatedLead, req.body);
    
    res.json(updatedLead);
  } catch (error) {
    handleValidationError(error, res);
  }
});
```

## Effect of Changes

- New leads are no longer automatically converted to clients
- Existing leads are not automatically converted to clients on server startup
- Changes to leads are not automatically synced to client records

This gives agents full control over when to convert a lead to a client, improving workflow management.

## Additional Fix: Lead Status Default Value

Changed the default status in the leads schema from "new" to "Leads" with proper capitalization:

```typescript
// BEFORE: In schema.ts
status: text("status").default("new"),

// AFTER: In schema.ts
status: text("status").default("Leads"),
```