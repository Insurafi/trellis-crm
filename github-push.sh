#!/bin/bash

echo "GitHub Push Helper"
echo "=================="
echo ""

# Check if token is provided as argument
if [ -z "$1" ]; then
  echo "Enter your GitHub Personal Access Token:"
  read -s GITHUB_TOKEN
else
  GITHUB_TOKEN=$1
fi

# Ask for username only if not provided
if [ -z "$2" ]; then
  echo "Enter your GitHub username (for the Insurafi organization):"
  read GITHUB_USERNAME
else
  GITHUB_USERNAME=$2
fi

echo ""
echo "Checking existing remote..."
# Update the existing origin remote with authentication
git remote set-url origin https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/Insurafi/trellis-crm.git

echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "Success! Your code has been pushed to GitHub."
  echo "You can view your repository at: https://github.com/Insurafi/trellis-crm"
else
  echo ""
  echo "There was an error pushing to GitHub."
  echo "Please check your token and username and try again."
fi