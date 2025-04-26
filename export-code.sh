#!/bin/bash

# Create export directory
mkdir -p export-code

# Copy key directories
echo "Copying client code..."
cp -r client export-code/

echo "Copying server code..."
cp -r server export-code/

echo "Copying shared code..."
cp -r shared export-code/

# Copy configuration files
echo "Copying configuration files..."
cp package.json export-code/
cp tsconfig.json export-code/
cp package-lock.json export-code/
cp vite.config.ts export-code/
cp tailwind.config.ts export-code/
cp postcss.config.js export-code/
cp drizzle.config.ts export-code/

# Create ZIP file
echo "Creating ZIP file..."
cd export-code
zip -r ../trellis-crm-export.zip .
cd ..

echo "Export complete! File saved as trellis-crm-export.zip"
echo "File size: $(du -h trellis-crm-export.zip | cut -f1)"