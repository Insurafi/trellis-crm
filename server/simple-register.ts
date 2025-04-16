import { Express } from 'express';
import { hashPassword } from './auth';
import { storage } from './storage';

export function setupSimpleRegister(app: Express) {
  // Add a simple registration page endpoint
  app.get('/simple-register', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Trellis | Simple Registration</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              padding: 24px;
              width: 100%;
              max-width: 400px;
              margin-top: 40px;
              height: fit-content;
            }
            h1 { color: #3b82f6; margin-top: 0; }
            .form-group { margin-bottom: 16px; }
            label { display: block; margin-bottom: 4px; font-weight: 500; }
            input {
              width: 100%;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 16px;
            }
            button {
              background-color: #3b82f6;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 12px 16px;
              font-size: 16px;
              cursor: pointer;
              width: 100%;
              margin-top: 8px;
            }
            button:hover { background-color: #2563eb; }
            .error { color: #ef4444; margin-top: 8px; }
            .success { color: #10b981; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Trellis Registration</h1>
            <p>Create a new account to access the platform</p>
            
            <div id="error-message" class="error"></div>
            <div id="success-message" class="success"></div>
            
            <form id="registration-form">
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
              </div>
              
              <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" required>
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required minlength="6">
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
              </div>
              
              <button type="submit">Register</button>
              
              <p style="margin-top: 16px; text-align: center;">
                <a href="/auth">Return to login</a>
              </p>
            </form>
          </div>
          
          <script>
            document.getElementById('registration-form').addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const errorElement = document.getElementById('error-message');
              const successElement = document.getElementById('success-message');
              errorElement.textContent = '';
              successElement.textContent = '';
              
              const username = document.getElementById('username').value;
              const fullName = document.getElementById('fullName').value;
              const email = document.getElementById('email').value;
              const password = document.getElementById('password').value;
              const confirmPassword = document.getElementById('confirmPassword').value;
              
              if (password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match';
                return;
              }
              
              try {
                const response = await fetch('/api/register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    username,
                    fullName,
                    email,
                    password,
                    role: 'agent',
                    active: true
                  }),
                  credentials: 'include'
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Registration failed');
                }
                
                const data = await response.json();
                console.log('Registration successful:', data);
                successElement.textContent = \`Registration successful! Welcome, \${data.fullName || data.username}!\`;
                
                // Redirect to dashboard after successful registration
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 1500);
                
              } catch (error) {
                console.error('Registration error:', error);
                errorElement.textContent = error.message || 'An error occurred during registration';
              }
            });
          </script>
        </body>
      </html>
    `);
  });
  
  // Add a direct registration endpoint that doesn't require a session
  app.post('/api/simple-register', async (req, res) => {
    try {
      const { username, email, password, fullName } = req.body;
      
      // Validate required fields
      if (!username || !email || !password || !fullName) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Create the user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName,
        role: 'agent',
        active: true
      });
      
      // Return success without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Simple registration error:', error);
      res.status(500).json({ message: 'Registration failed', details: error.message });
    }
  });
}