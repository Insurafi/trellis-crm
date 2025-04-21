// Test script to verify Monica can update her agent profile
import fetch from 'node-fetch';

async function testMonicaLogin() {
  try {
    console.log("Testing Monica's login...");
    
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'monicapalmer388',
        password: 'agent123',
      }),
    });
    
    if (!loginResponse.ok) {
      console.error(`Login failed: ${loginResponse.status}`);
      console.error(await loginResponse.text());
      return null;
    }
    
    const userData = await loginResponse.json();
    console.log("Login successful:", userData);
    
    // Get cookies from response
    const cookies = loginResponse.headers.get('set-cookie');
    
    return { userData, cookies };
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
}

async function testAgentLookup(cookies) {
  try {
    console.log("Testing agent lookup...");
    
    const agentResponse = await fetch('http://localhost:5000/api/agents/by-user', {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!agentResponse.ok) {
      console.error(`Agent lookup failed: ${agentResponse.status}`);
      console.error(await agentResponse.text());
      return null;
    }
    
    const agentData = await agentResponse.json();
    console.log("Agent lookup successful:", agentData);
    
    return agentData;
  } catch (error) {
    console.error("Error looking up agent:", error);
    return null;
  }
}

async function testProfileUpdate(cookies) {
  try {
    console.log("Testing profile update with license and NPN...");
    
    const updateData = {
      licenseNumber: "IL-123456",
      npn: "9876543"
    };
    
    const updateResponse = await fetch('http://localhost:5000/api/agents/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify(updateData),
    });
    
    if (!updateResponse.ok) {
      console.error(`Profile update failed: ${updateResponse.status}`);
      console.error(await updateResponse.text());
      return false;
    }
    
    const result = await updateResponse.json();
    console.log("Profile update successful:", result);
    
    // Verify the update by fetching the profile again
    const verifyResponse = await fetch('http://localhost:5000/api/agents/by-user', {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (verifyResponse.ok) {
      const updatedProfile = await verifyResponse.json();
      console.log("Updated profile verification:", updatedProfile);
      
      // Check if the license and NPN were updated
      const licenseUpdated = updatedProfile.licenseNumber === updateData.licenseNumber;
      const npnUpdated = updatedProfile.npn === updateData.npn;
      
      console.log(`License updated: ${licenseUpdated ? 'YES' : 'NO'}`);
      console.log(`NPN updated: ${npnUpdated ? 'YES' : 'NO'}`);
      
      return licenseUpdated && npnUpdated;
    } else {
      console.error("Failed to verify profile update");
      return false;
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return false;
  }
}

async function main() {
  try {
    // Login as Monica
    const loginResult = await testMonicaLogin();
    if (!loginResult) {
      console.error("Login failed, cannot continue");
      return;
    }
    
    // Lookup agent profile
    const agentData = await testAgentLookup(loginResult.cookies);
    if (!agentData) {
      console.error("Agent lookup failed, cannot continue");
      return;
    }
    
    // Update profile with license and NPN
    const updateResult = await testProfileUpdate(loginResult.cookies);
    if (updateResult) {
      console.log("✅ SUCCESS! Monica can now update her license and NPN information");
    } else {
      console.log("❌ FAILED! Monica still cannot update her license and NPN information");
    }
  } catch (error) {
    console.error("Error in test script:", error);
  }
}

main();