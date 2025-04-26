#!/bin/bash

# Create a clean directory for the export
mkdir -p export-code
rm -rf export-code/*

# Copy essential files and directories
cp -r client export-code/
cp -r server export-code/
cp -r shared export-code/
cp -r public export-code/
cp -r migrations export-code/

# Copy config files
cp package.json export-code/
cp package-lock.json export-code/
cp tsconfig.json export-code/
cp vite.config.ts export-code/
cp tailwind.config.ts export-code/
cp postcss.config.js export-code/
cp drizzle.config.ts export-code/
cp theme.json export-code/
cp .gitignore export-code/ 2>/dev/null || touch export-code/.gitignore

# Create a ZIP file with the export
cd export-code
zip -r ../trellis-crm-export.zip .
cd ..

echo "Export completed. Zip file created: trellis-crm-export.zip"
echo "You can download this file from Replit."