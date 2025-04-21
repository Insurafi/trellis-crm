/**
 * Verification script to test if Monica Palmer can update her profile
 * using the /api/agents/profile endpoint after the route reordering fix
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://trellis-inga4.replit.app';
const USERNAME = 'monicapalmer388';
const PASSWORD = 'agent123';

async function testMonicaLogin() {
  console.log("Testing Monica's login credentials...");
  console.log(`Attempting to log in with username: ${USERNAME}`);
  
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: USERNAME,
        password: PASSWORD
      })
    });
    
    if (!loginResponse.ok) {
      console.error(`❌ Login failed with status ${loginResponse.status}`);
      return null;
    }
    
    // Extract cookies for session management
    const cookies = loginResponse.headers.get('set-cookie');
    const userData = await loginResponse.json();
    
    console.log(`✅ Successfully logged in as ${USERNAME} (User ID: ${userData.id})`);
    return {
      user: userData,
      cookies
    };
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
}

async function testProfileWithProfileEndpoint(loginData) {
  if (!loginData || !loginData.cookies) {
    console.error("No login data available, cannot test profile update");
    return false;
  }
  
  console.log("\nTesting profile update using /api/agents/profile endpoint...");
  console.log("Cookies:", loginData.cookies);
  
  try {
    // Create unique test values
    const timestamp = Date.now();
    const updateData = {
      licenseNumber: `IL-PROFILE-${timestamp}`,
      npn: `PROFILE-${timestamp.toString().slice(-4)}`
    };
    
    console.log("Sending update with data:", updateData);
    
    // First, test if we can get our own agent data to confirm auth is working
    console.log("\nTrying to get agent data to verify authentication is working...");
    const agentDataResponse = await fetch(`${BASE_URL}/api/agent-data/9`, {
      method: 'GET',
      headers: {
        'Cookie': loginData.cookies
      }
    });
    
    if (agentDataResponse.ok) {
      const agentData = await agentDataResponse.json();
      console.log("✅ Successfully retrieved agent data:", agentData);
    } else {
      console.error("❌ Could not retrieve agent data, auth might not be working correctly");
      console.error(`Status: ${agentDataResponse.status}`);
      const errorText = await agentDataResponse.text();
      console.error(errorText);
    }
    
    // Make the PATCH request to the profile endpoint
    console.log("\nSending PATCH request to /api/agents/profile...");
    const profileResponse = await fetch(`${BASE_URL}/api/agents/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': loginData.cookies
      },
      body: JSON.stringify(updateData),
    });
    
    // Log request details for debugging
    console.log("Request URL:", `${BASE_URL}/api/agents/profile`);
    console.log("Request method:", 'PATCH');
    console.log("Request headers:", {
      'Content-Type': 'application/json',
      'Cookie': loginData.cookies
    });
    
    // Check the response
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error(`❌ Profile update failed with status ${profileResponse.status}`);
      console.error(errorText);
      
      // Try a direct update to agent ID 9 as a fallback
      console.log("\nAttempting fallback: direct update to /api/agents/9...");
      const directUpdateResponse = await fetch(`${BASE_URL}/api/agents/9`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': loginData.cookies
        },
        body: JSON.stringify(updateData),
      });
      
      if (directUpdateResponse.ok) {
        const directResult = await directUpdateResponse.json();
        console.log("✅ Direct update to /api/agents/9 succeeded:", directResult);
        console.log("This suggests the issue is with routing, not authentication or permissions");
      } else {
        const directError = await directUpdateResponse.text();
        console.error("❌ Direct update also failed:", directError);
      }
      
      return false;
    }
    
    // Get the updated data
    const updatedProfile = await profileResponse.json();
    console.log("Profile update successful:", updatedProfile);
    
    // Verify that our updates were applied
    const licenseUpdated = updatedProfile.licenseNumber === updateData.licenseNumber;
    const npnUpdated = updatedProfile.npn === updateData.npn;
    
    console.log(`License updated: ${licenseUpdated ? '✅ YES' : '❌ NO'}`);
    console.log(`NPN updated: ${npnUpdated ? '✅ YES' : '❌ NO'}`);
    
    return licenseUpdated && npnUpdated;
  } catch (error) {
    console.error("Error testing profile update:", error);
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
    
    // Test updating the profile with the profile endpoint
    const profileResult = await testProfileWithProfileEndpoint(loginResult);
    
    if (profileResult) {
      console.log("\n✅ SUCCESS! The /api/agents/profile endpoint is now working correctly for Monica!");
      console.log("Route reordering fix was successful.");
    } else {
      console.log("\n❌ FAILED! The /api/agents/profile endpoint still isn't working for Monica");
      console.log("Further debugging is needed.");
    }
  } catch (error) {
    console.error("Error in verification script:", error);
  }
}

main();