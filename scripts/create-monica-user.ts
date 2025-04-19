import { Pool, neonConfig } from '@neondatabase/serverless';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Connect to the database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Custom implementation of hashPassword to avoid dependency issues
async function hashPwd(password: string) {
  const scryptAsync = promisify(scrypt);
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createMonicaAgent() {
  try {
    console.log('Creating Monica Palmer agent account...');
    
    // Step 1: Create user account
    const hashedPassword = await hashPwd('agent123');
    
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
    console.log('Agent details:');
    console.log(`Agent ID: ${agentId}`);
    console.log(`User ID: ${userId}`);
    console.log(`License Number: AG100014`);
    console.log(`Commission: 65%`);
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