// Test login script
import fetch from 'node-fetch';

async function testLogin(username, password) {
  try {
    console.log(`Testing login for: ${username}`);
    
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log(`✅ Login successful for ${username}!`);
      console.log('User data:', user);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Login failed for ${username}: ${response.status} ${error}`);
      return false;
    }
  } catch (error) {
    console.error(`Error testing login for ${username}:`, error);
    return false;
  }
}

async function main() {
  // Test Monica's accounts
  await testLogin('monicapalmer388', 'agent123');
  await testLogin('monicapalmer', 'agent123');
  
  // Test a known working account as control
  await testLogin('admin', 'admin123');
}

main();