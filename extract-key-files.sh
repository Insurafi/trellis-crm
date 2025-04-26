#!/bin/bash

# Create directory for extracted files
mkdir -p extracted_code

# Extract key files from the codebase
echo "Extracting key files from codebase..."

# Core schema and database files
cp shared/schema.ts extracted_code/
cp server/database-storage.ts extracted_code/
cp server/db.ts extracted_code/ 2>/dev/null || echo "No db.ts file found"

# Core route files
cp server/routes.ts extracted_code/
cp server/routes-agents-leads-policies.ts extracted_code/ 2>/dev/null
cp server/index.ts extracted_code/

# Important client files
mkdir -p extracted_code/client_components
cp client/src/pages/leads.tsx extracted_code/client_components/ 2>/dev/null
cp client/src/pages/clients.tsx extracted_code/client_components/ 2>/dev/null
cp client/src/pages/dashboard.tsx extracted_code/client_components/ 2>/dev/null

# Auth files
cp server/auth.ts extracted_code/ 2>/dev/null
cp server/client-auth.ts extracted_code/ 2>/dev/null

# Sync mechanism files
cp server/lead-client-sync.ts extracted_code/ 2>/dev/null
cp server/sync-existing-leads-to-clients.ts extracted_code/ 2>/dev/null
cp server/policy-client-sync.ts extracted_code/ 2>/dev/null

echo "Files extracted to 'extracted_code' directory."
ls -la extracted_code

echo ""
echo "You can view each file by using the str_replace_editor tool with the 'view' command,"
echo "pointing to files in the extracted_code directory."