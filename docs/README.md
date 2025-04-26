# Trellis CRM Documentation

This folder contains detailed documentation of the Trellis CRM system, focusing on recent fixes and system architecture.

## Documentation Index

1. [Project Overview](PROJECT_OVERVIEW.md) - Overview of the entire Trellis CRM project
2. [Lead-to-Client Conversion Fixes](LEAD_CLIENT_FIXES.md) - Details on the fixes to prevent automatic lead-to-client conversion
3. [Monica's Permission Fix](MONICA_PERMISSION_FIX.md) - Explanation of the special permissions for Monica Palmer's account
4. [Lead Form Fixes](LEAD_FORM_FIXES.md) - Information about fixes to the lead creation form

## Key Issues Fixed

### 1. Lead-to-Client Conversion

We disabled three mechanisms that were automatically converting leads to clients:
- The POST /api/leads endpoint was creating a client record for every new lead
- The sync-existing-leads-to-clients.ts was converting leads at server startup
- The lead-client-sync.ts was syncing lead changes to client records

### 2. Monica Palmer's Permissions

Special handling was added to the getLeadsByAgent function in database-storage.ts to allow Monica Palmer (Agent ID: 9) to see all leads in the system, rather than just leads assigned to her.

### 3. Lead Status Default Value

The default status in the lead schema was changed from "new" to "Leads" with proper capitalization.

### 4. Lead Form Issues

Fixed several issues with the lead creation form including:
- Duplicate form definitions causing conflicts
- Form initialization order problems
- Missing addressLine2 field
- Issues with form state management

## Accessing the Full Code

The complete Trellis CRM code is available in this repository. The most critical files include:

- `server/database-storage.ts` - Contains database operations and the fix for Monica's permissions
- `server/routes-agents-leads-policies.ts` - Contains API routes for leads and the fixes for lead-to-client conversion
- `shared/schema.ts` - Contains the database schema including the fixed lead status default
- `client/src/pages/leads.tsx` - Contains the lead management page with form fixes

## Code Export

While a ZIP file of the entire codebase is available (trellis-crm-export.zip), looking at these documentation files will give you a clear understanding of the recent fixes implemented in the system.