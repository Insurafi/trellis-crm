// One-time script to fix Monica Palmer's license and NPN information
const { Pool } = require('pg');

async function directDatabaseUpdate() {
  // Create a new connection pool using the DATABASE_URL environment variable
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    console.log("Starting direct database update for Monica Palmer (agent ID 9)");
    
    // Update Monica's agent record directly in the database
    const result = await pool.query(`
      UPDATE agents 
      SET 
        "licenseNumber" = 'IL-123456', 
        "npn" = '9876543'
      WHERE id = 9
      RETURNING *
    `);
    
    if (result.rows.length === 0) {
      console.error("Failed to update agent record - no rows returned");
      return false;
    }
    
    console.log("Successfully updated Monica's agent record (ID 9):");
    console.log(JSON.stringify(result.rows[0], null, 2));
    return true;
  } catch (error) {
    console.error("Error during direct database update:", error);
    return false;
  } finally {
    // Close the database connection pool
    await pool.end();
  }
}

async function main() {
  const success = await directDatabaseUpdate();
  if (success) {
    console.log("✅ SUCCESS! Monica's license and NPN information has been updated directly in the database");
  } else {
    console.log("❌ FAILED! Could not update Monica's license and NPN information");
  }
}

main();