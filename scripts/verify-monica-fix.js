// Verify that Monica can log in and update her profile
import fetch from 'node-fetch';

async function testMonicaLogin() {
  try {
    console.log("Testing Monica's login credentials...");
    
    // Try both of Monica's accounts
    const accounts = [
      { username: "monicapalmer388", password: "agent123" },
      { username: "monicapalmer", password: "agent123" }
    ];
    
    let loggedInAccount = null;
    let cookies = null;
    
    for (const account of accounts) {
      try {
        console.log(`Attempting to log in with username: ${account.username}`);
        const loginResponse = await fetch('https://trellis-inga4.replit.app/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(account)
        });
        
        if (loginResponse.ok) {
          cookies = loginResponse.headers.get('set-cookie');
          const user = await loginResponse.json();
          
          console.log(`✅ Successfully logged in as ${account.username} (User ID: ${user.id})`);
          loggedInAccount = { ...account, userId: user.id, cookies };
          break;
        } else {
          console.log(`❌ Login failed for ${account.username}: ${loginResponse.status}`);
        }
      } catch (err) {
        console.error(`Error trying to log in as ${account.username}:`, err);
      }
    }
    
    if (!loggedInAccount) {
      console.error("❌ Failed to log in with any of Monica's accounts");
      return null;
    }
    
    return loggedInAccount;
  } catch (error) {
    console.error("Error in test login process:", error);
    return null;
  }
}

async function testProfileAccess(loginData) {
  if (!loginData || !loginData.cookies) {
    console.error("No login data available, cannot test profile access");
    return false;
  }
  
  try {
    console.log(`Testing agent profile access for user ID ${loginData.userId}...`);
    
    // Try to get agent by user (which would be used from the agent profile page)
    const agentResponse = await fetch('https://trellis-inga4.replit.app/api/agents/by-user', {
      headers: {
        'Cookie': loginData.cookies
      }
    });
    
    if (!agentResponse.ok) {
      console.error(`❌ Failed to get agent profile: ${agentResponse.status}`);
      console.error(await agentResponse.text());
      return false;
    }
    
    const agent = await agentResponse.json();
    console.log(`✅ Successfully retrieved agent profile for Monica:`, agent);
    
    return { success: true, agent };
  } catch (error) {
    console.error("Error testing profile access:", error);
    return { success: false };
  }
}

async function testProfileUpdate(loginData, agent) {
  if (!loginData || !loginData.cookies) {
    console.error("No login data available, cannot test profile update");
    return false;
  }
  
  if (!agent || !agent.id) {
    console.error("No agent data available, cannot test profile update");
    return false;
  }
  
  try {
    console.log(`Testing profile update for agent ID ${agent.id}...`);
    
    // First, try the profile endpoint
    console.log("ATTEMPT 1: Using /api/agents/profile endpoint...");
    const updateData = {
      licenseNumber: "IL-UPDATED-" + Date.now(),
      npn: "9876-" + Date.now().toString().slice(-4)
    };
    
    const profileResponse = await fetch('https://trellis-inga4.replit.app/api/agents/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': loginData.cookies
      },
      body: JSON.stringify(updateData),
    });
    
    let profileSuccess = false;
    let updateResult = null;
    
    if (profileResponse.ok) {
      updateResult = await profileResponse.json();
      console.log("Profile update successful using /api/agents/profile:", updateResult);
      profileSuccess = true;
    } else {
      console.error(`❌ Profile update failed using /api/agents/profile: ${profileResponse.status}`);
      console.error(await profileResponse.text());
      
      // If profile endpoint fails, try direct agent ID endpoint as backup
      console.log("ATTEMPT 2: Using direct /api/agents/:id endpoint...");
      const directResponse = await fetch(`https://trellis-inga4.replit.app/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': loginData.cookies
        },
        body: JSON.stringify(updateData),
      });
      
      if (directResponse.ok) {
        updateResult = await directResponse.json();
        console.log("Profile update successful using direct ID endpoint:", updateResult);
        profileSuccess = true;
      } else {
        console.error(`❌ Profile update failed using direct ID endpoint: ${directResponse.status}`);
        console.error(await directResponse.text());
      }
    }
    
    if (profileSuccess) {
      // Verify the update by fetching the profile again
      const verifyResponse = await fetch('https://trellis-inga4.replit.app/api/agents/by-user', {
        headers: {
          'Cookie': loginData.cookies
        }
      });
      
      if (verifyResponse.ok) {
        const updatedProfile = await verifyResponse.json();
        console.log("Updated profile verification:", updatedProfile);
        
        const licenseUpdated = updatedProfile.licenseNumber === updateData.licenseNumber;
        const npnUpdated = updatedProfile.npn === updateData.npn;
        
        console.log(`License updated: ${licenseUpdated ? 'YES' : 'NO'}`);
        console.log(`NPN updated: ${npnUpdated ? 'YES' : 'NO'}`);
        
        return licenseUpdated && npnUpdated;
      }
    }
    
    return false;
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
    
    // Test accessing the profile
    const profileResult = await testProfileAccess(loginResult);
    if (!profileResult.success) {
      console.error("Profile access failed, cannot continue");
      return;
    }
    
    // Test updating the profile
    const updateResult = await testProfileUpdate(loginResult, profileResult.agent);
    
    if (updateResult) {
      console.log("✅ SUCCESS! Monica can now update her license and NPN information");
    } else {
      console.log("❌ FAILED! Monica still cannot update her license and NPN information");
    }
  } catch (error) {
    console.error("Error in verification script:", error);
  }
}

main();