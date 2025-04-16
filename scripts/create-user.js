// Interactive script to create users
import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createUser() {
  try {
    console.log("\n=== Create New User ===\n");
    
    // Gather user information
    const username = await prompt("Username: ");
    const fullName = await prompt("Full Name: ");
    const email = await prompt("Email: ");
    const password = await prompt("Password: ");
    
    let role = await prompt("Role (admin, agent, team_leader, support) [default: agent]: ");
    if (!role || !['admin', 'agent', 'team_leader', 'support'].includes(role)) {
      role = 'agent';
    }
    
    console.log("\nCreating user with the following information:");
    console.log(`Username: ${username}`);
    console.log(`Full Name: ${fullName}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${'*'.repeat(password.length)}`);
    console.log(`Role: ${role}`);
    
    const confirm = await prompt("\nConfirm creation? (y/n): ");
    if (confirm.toLowerCase() !== 'y') {
      console.log("User creation cancelled.");
      rl.close();
      return;
    }
    
    console.log("\nSending registration request...");
    
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        fullName,
        email,
        password,
        role,
        active: true
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("\n✅ User created successfully!");
      console.log("User ID:", data.id);
      console.log("Username:", data.username);
      console.log("Full Name:", data.fullName);
      console.log("Role:", data.role);
    } else {
      console.log("\n❌ Error creating user:");
      console.log(data.message || 'Unknown error');
    }
  } catch (error) {
    console.error("\n❌ Exception occurred:", error.message);
  } finally {
    rl.close();
  }
}

createUser();