// Script to create a new agent directly
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Create a new user with agent role
 * @param {Object} userData User data to create
 */
async function createAgentUser(userData) {
  try {
    console.log("Creating new agent user:", userData.username);
    
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...userData,
        role: 'agent',
        active: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const user = await response.json();
    console.log("✅ Agent user created successfully:", user);
    return user;
  } catch (error) {
    console.error("❌ Failed to create agent user:", error.message);
    throw error;
  }
}

// Read command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log("Usage: node add-agent.js <username> <fullName> <email> [password]");
  console.log("Example: node add-agent.js johndoe 'John Doe' john@example.com secret123");
  process.exit(1);
}

// Extract agent details from arguments
const [username, fullName, email, password = 'password123'] = args;

// Create the agent user
createAgentUser({
  username,
  fullName,
  email,
  password
})
  .then(() => {
    console.log("Agent creation completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Agent creation failed:", error);
    process.exit(1);
  });