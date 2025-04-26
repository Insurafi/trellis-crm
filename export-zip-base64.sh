#!/bin/bash

# Convert ZIP to base64 and split into manageable chunks
base64 trellis-crm-export.zip > trellis-crm-export.b64

# Count lines in the base64 file to report size
LINES=$(wc -l < trellis-crm-export.b64)
SIZE=$(ls -lh trellis-crm-export.zip | awk '{print $5}')

echo "=== Trellis CRM Code Export ==="
echo "Original ZIP size: $SIZE"
echo "Base64 line count: $LINES"
echo ""
echo "INSTRUCTIONS:"
echo "1. Copy the Base64 output below"
echo "2. Save it to a file named 'trellis-crm-export.b64' on your computer"
echo "3. Run: base64 -d trellis-crm-export.b64 > trellis-crm-export.zip"
echo "4. Extract the ZIP file"
echo ""
echo "=== BASE64 OUTPUT BEGINS ==="
cat trellis-crm-export.b64
echo "=== BASE64 OUTPUT ENDS ==="