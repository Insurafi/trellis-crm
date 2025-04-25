#!/bin/bash

# Make sure the zip file exists
if [ -f trellis-crm-code.zip ]; then
  echo "Code archive is ready to export."
  echo "The file size is $(du -h trellis-crm-code.zip | cut -f1)"
  echo ""
  echo "To download the code:"
  echo "1. Look at the 'Files' panel on the left side of Replit"
  echo "2. Find the file named 'trellis-crm-code.zip'"
  echo "3. Right-click on it and select 'Download'"
  echo ""
  echo "If you want to clone via Git, create your GitHub repository and run:"
  echo "git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git"
  echo "git push -u origin main"
else
  echo "Error: Code archive not found. Creating it now..."
  # Create the archive if it doesn't exist
  mkdir -p export-code
  cp -r client server shared export-code/
  cp package.json tsconfig.json vite.config.ts export-code/
  cd export-code
  zip -r ../trellis-crm-new.zip .
  cd ..
  echo "New archive created as 'trellis-crm-new.zip'"
  echo "Please run this script again to download the new archive."
fi