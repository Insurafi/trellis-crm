/**
 * Verification script to test if Monica Palmer can now update her profile
 * using the redesigned /api/agents/profile endpoint
 */
import fetch from 'node-fetch';

async function testMonicaLogin() {
  console.log("Logging in as Monica Palmer...");
  try {
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'monicapalmer388', password: 'agent123' })
    });
    
    if (!loginResponse.ok) {
      console.error(`Login failed with status ${loginResponse.status}`);
      return null;
    }
    
    const loginData = await loginResponse.json();
    console.log("Login successful:", loginData.username);
    
    // Get the cookies for authenticated requests
    const cookies = loginResponse.headers.get('set-cookie');
    return { userData: loginData, cookies };
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

async function testProfileEndpoint(loginData) {
  if (!loginData || !loginData.cookies) {
    console.error("Cannot test profile endpoint without login data");
    return false;
  }
  
  console.log("\nTesting profile endpoint with new router implementation...");
  
  // Generate a unique test value for license number to prove we can update it
  const testLicenseNumber = `TEST-LICENSE-${Date.now()}`;
  const testNpn = `TEST-NPN-${Date.now()}`;
  
  try {
    const profileResponse = await fetch('http://localhost:5000/api/agents/profile', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': loginData.cookies
      },
      body: JSON.stringify({
        licenseNumber: testLicenseNumber,
        npn: testNpn
      })
    });
    
    const responseText = await profileResponse.text();
    
    if (!profileResponse.ok) {
      console.error(`Profile update FAILED with status ${profileResponse.status}`);
      console.error("Error response:", responseText);
      return false;
    }
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", responseText);
      return false;
    }
    
    console.log("Profile update SUCCESS!");
    console.log("Updated fields:");
    console.log(`- License Number: ${responseData.licenseNumber}`);
    console.log(`- NPN: ${responseData.npn}`);
    
    if (responseData.licenseNumber === testLicenseNumber && 
        responseData.npn === testNpn) {
      console.log("\n✅ VERIFICATION SUCCESSFUL: Profile update with router implementation works correctly!");
      return true;
    } else {
      console.log("\n❌ VERIFICATION FAILED: Response data doesn't match sent values");
      console.log("Response data:", responseData);
      return false;
    }
  } catch (error) {
    console.error("Profile update error:", error);
    return false;
  }
}

async function main() {
  const loginData = await testMonicaLogin();
  if (!loginData) {
    console.error("Login failed, cannot continue verification");
    process.exit(1);
  }
  
  const success = await testProfileEndpoint(loginData);
  
  if (success) {
    console.log("\n=======================================================");
    console.log("🎉 ROUTER IMPLEMENTATION FIX WORKS! Monica can now update her profile!");
    console.log("=======================================================");
    process.exit(0);
  } else {
    console.log("\n=======================================================");
    console.log("❌ ROUTER IMPLEMENTATION FIX FAILED! Monica still cannot update her profile");
    console.log("=======================================================");
    process.exit(1);
  }
}

main();