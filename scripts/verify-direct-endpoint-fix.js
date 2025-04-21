/**
 * Verification script to test if the direct ID endpoint still works for Monica Palmer
 * even after the router implementation
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

async function testDirectIdEndpoint(loginData) {
  if (!loginData || !loginData.cookies) {
    console.error("Cannot test direct ID endpoint without login data");
    return false;
  }
  
  console.log("\nTesting direct ID endpoint with new router implementation...");
  
  // Generate a unique test value for license number to prove we can update it
  const testLicenseNumber = `DIRECT-LICENSE-${Date.now()}`;
  const testNpn = `DIRECT-NPN-${Date.now()}`;
  
  try {
    // Use the direct ID endpoint (/api/agents/9) for Monica
    const response = await fetch('http://localhost:5000/api/agents/9', {
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
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`Direct ID endpoint update FAILED with status ${response.status}`);
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
    
    console.log("Direct ID endpoint update SUCCESS!");
    console.log("Updated fields:");
    console.log(`- License Number: ${responseData.licenseNumber}`);
    console.log(`- NPN: ${responseData.npn}`);
    
    if (responseData.licenseNumber === testLicenseNumber && 
        responseData.npn === testNpn) {
      console.log("\n✅ VERIFICATION SUCCESSFUL: Direct ID endpoint still works correctly!");
      return true;
    } else {
      console.log("\n❌ VERIFICATION FAILED: Response data doesn't match sent values");
      console.log("Response data:", responseData);
      return false;
    }
  } catch (error) {
    console.error("Direct ID endpoint error:", error);
    return false;
  }
}

async function main() {
  const loginData = await testMonicaLogin();
  if (!loginData) {
    console.error("Login failed, cannot continue verification");
    process.exit(1);
  }
  
  const success = await testDirectIdEndpoint(loginData);
  
  if (success) {
    console.log("\n=======================================================");
    console.log("🎉 DIRECT ID ENDPOINT STILL WORKS! Both endpoints are functional!");
    console.log("=======================================================");
    process.exit(0);
  } else {
    console.log("\n=======================================================");
    console.log("❌ DIRECT ID ENDPOINT FAILED! The router implementation may have broken it");
    console.log("=======================================================");
    process.exit(1);
  }
}

main();