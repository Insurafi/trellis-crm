#!/bin/bash

# Test registration with curl
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "password": "password123",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "agent",
    "active": true
  }'