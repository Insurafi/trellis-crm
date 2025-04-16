// Script to register a new user directly
import fetch from 'node-fetch';

async function registerUser() {
  try {
    const userData = {
      username: "testadmin",
      fullName: "Test Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      active: true
    };

    console.log("Attempting to register new user:", userData.username);
    
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Registration failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("User registration successful:", result);
    return result;
  } catch (error) {
    console.error("Error registering user:", error.message);
    throw error;
  }
}

registerUser()
  .then(user => {
    console.log("Successfully created user:", user.username);
    process.exit(0);
  })
  .catch(error => {
    console.error("Registration script failed:", error);
    process.exit(1);
  });