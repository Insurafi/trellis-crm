import { hashPassword } from '../server/auth.js';
import { pool, db } from '../server/db.js';
import { users, agents } from '../shared/schema.js';

async function createMonicaAgent() {
  try {
    console.log('Creating Monica Palmer agent account...');
    
    // Step 1: Create user account
    const hashedPassword = await hashPassword('agent123');
    
    // Insert user directly with SQL
    const userResult = await pool.query(`
      INSERT INTO users (username, password, "firstName", "lastName", "fullName", email, role, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      'monicapalmer', 
      hashedPassword, 
      'Monica', 
      'Palmer', 
      'Monica Palmer', 
      'monica.palmer@trelliscrm.com', 
      'agent', 
      true
    ]);
    
    const userId = userResult.rows[0].id;
    console.log(`Created user with ID: ${userId}`);
    
    // Step 2: Create agent record
    const agentResult = await pool.query(`
      INSERT INTO agents ("userId", "licenseNumber", "hireDate", "commissionPercentage", "uplineAgentId")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      userId,
      'AG100014',  // Unique license number
      new Date(),  // Hire date is today
      65,          // 65% commission percentage
      1            // Upline is admin/broker (ID 1)
    ]);
    
    const agentId = agentResult.rows[0].id;
    console.log(`Created agent with ID: ${agentId}`);
    
    console.log('Monica Palmer account created successfully!');
    console.log('-------------------------------------');
    console.log('Login credentials:');
    console.log('Username: monicapalmer');
    console.log('Password: agent123');
    console.log('-------------------------------------');
    
  } catch (error) {
    console.error('Error creating Monica Palmer agent account:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
createMonicaAgent();