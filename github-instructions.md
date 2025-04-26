# Getting Trellis CRM Code to GitHub

## 1. Create a GitHub Repository
1. Go to GitHub.com and log in
2. Click the "+" button in the top-right and select "New repository"
3. Name your repository (e.g., "trellis-crm")
4. Choose Public or Private
5. Do NOT initialize with README, .gitignore, or license
6. Click "Create repository"

## 2. Create a Personal Access Token
1. On GitHub, go to Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token" (classic)
3. Name it (e.g., "Trellis CRM Access")
4. Select the "repo" scope
5. Click "Generate token"
6. Copy the token (you won't see it again)

## 3. Run This Script in Replit's Shell

Once you have your GitHub username and token, run these commands in the Shell:

```bash
# Configure Git
git config --global user.name "YOUR_GITHUB_USERNAME"
git config --global user.email "YOUR_EMAIL@example.com"

# Initialize Git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit of Trellis CRM"

# Add your GitHub repository as remote
git remote add origin https://YOUR_GITHUB_USERNAME:YOUR_PERSONAL_ACCESS_TOKEN@github.com/YOUR_GITHUB_USERNAME/trellis-crm.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace:
- `YOUR_GITHUB_USERNAME` with your actual GitHub username
- `YOUR_EMAIL@example.com` with your email
- `YOUR_PERSONAL_ACCESS_TOKEN` with the token you generated
- `trellis-crm` with your repository name if different