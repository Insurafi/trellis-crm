#!/bin/bash
# Script to push code directly to GitHub

# Prompt for GitHub username
echo "Enter your GitHub username:"
read github_username

# Prompt for repository name
echo "Enter repository name (press Enter for 'trellis-crm'):"
read repo_name
repo_name=${repo_name:-trellis-crm}

# Prompt for personal access token
echo "Enter your GitHub personal access token (will be hidden):"
read -s github_token
echo ""

# Configure Git
git config --global user.name "$github_username"
git config --global user.email "$github_username@users.noreply.github.com"

# Create a new repo if it doesn't exist
echo "Creating GitHub repository..."
curl -s -X POST -H "Authorization: token $github_token" \
     -d "{\"name\":\"$repo_name\", \"description\":\"Trellis CRM - Insurance Agency Management System\"}" \
     https://api.github.com/user/repos

# Initialize Git if needed
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
fi

# Add remote origin
echo "Setting up remote repository..."
git remote remove origin 2>/dev/null
git remote add origin https://$github_username:$github_token@github.com/$github_username/$repo_name.git

# Add all files
echo "Adding files to Git..."
git add .

# Commit changes
echo "Committing files..."
git commit -m "Initial commit of Trellis CRM"

# Create and push to main branch
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main --force

echo "Done! Your code is now available at: https://github.com/$github_username/$repo_name"