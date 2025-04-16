// Script to register a new user with command line arguments
import fetch from 'node-fetch';

async function registerUser(username, fullName, email, password, role) {
  try {
    console.log("Attempting to register new user:", username);
    
    const userData = {
      username,
      fullName, 
      email,
      password,
      role: role || 'agent',
      active: true
    };
    
    console.log("User data:", { ...userData, password: '*'.repeat(password.length) });
    
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Registration failed:", result.message || 'Unknown error');
      return null;
    }

    console.log("User registration successful:", result);
    return result;
  } catch (error) {
    console.error("Error registering user:", error.message);
    return null;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 4) {
  console.error("Usage: node register-new-user.js <username> <fullName> <email> <password> [role]");
  process.exit(1);
}

const [username, fullName, email, password, role] = args;

registerUser(username, fullName, email, password, role)
  .then(user => {
    if (user) {
      console.log("Successfully created user:", user.username);
      process.exit(0);
    } else {
      console.error("Failed to create user");
      process.exit(1);
    }
  })
  .catch(error => {
    console.error("Registration script failed:", error);
    process.exit(1);
  });