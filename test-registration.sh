#!/bin/bash

# Test registration script for Trellis

echo "Registering test user..."

# Make the API call
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"testagent3","fullName":"Test Agent 3","email":"agent3@example.com","password":"password123","role":"agent"}' \
  http://localhost:5000/api/register

echo -e "\n\nRegistration complete!"