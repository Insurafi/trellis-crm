# How to Push Your Code to GitHub

## Step 1: Create a Personal Access Token (PAT)

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name like "Trellis CRM Access"
4. Set an expiration (recommended 30-90 days)
5. Select scopes:
   - `repo` (all repo permissions)
   - `workflow`
6. Click "Generate token"
7. **IMPORTANT**: Copy your token immediately - you won't be able to see it again!

## Step 2: Push Code from Replit

Run these commands in your Replit shell (which I can see is already connected to your repository):

```bash
# Use your GitHub username
git config --global user.name "YOUR_GITHUB_USERNAME"

# Use your GitHub email
git config --global user.email "YOUR_GITHUB_EMAIL"

# Push to GitHub (you'll be prompted for username and password)
# For username: enter your GitHub username
# For password: enter your Personal Access Token (NOT your GitHub password)
git push -u origin main
```

## Step 3: Verify

After pushing, visit https://github.com/Insurafi/trellis-crm to confirm your code is there.

## Alternative Methods

If you're having trouble pushing from Replit, here are two alternatives:

1. **Clone Repository Locally**:
   ```bash
   git clone https://github.com/Insurafi/trellis-crm.git
   cd trellis-crm
   # Copy all files from Replit to this folder
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Upload directly on GitHub website**:
   1. Download the ZIP file from Replit (using `/github-zip` or the Files panel)
   2. Extract it on your computer
   3. Go to https://github.com/Insurafi/trellis-crm
   4. Click "Add file" → "Upload files"
   5. Drag and drop files or browse to select them
   6. Click "Commit changes"