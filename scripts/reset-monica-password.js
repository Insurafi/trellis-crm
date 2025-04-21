// Script to reset Monica's password
import pg from 'pg';
import crypto from 'crypto';
import util from 'util';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const scryptAsync = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function resetMonicaPassword() {
  try {
    console.log('Starting Monica password reset...');
    
    // Hash the new password
    const newPassword = 'agent123';
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the password for both Monica accounts
    const updateResult = await pool.query(
      `UPDATE users 
       SET password = $1 
       WHERE username = 'monicapalmer388' OR username = 'monicapalmer'`,
      [hashedPassword]
    );
    
    console.log(`Updated ${updateResult.rowCount} user records`);
    
    // Verify the accounts
    const users = await pool.query(
      `SELECT id, username, email, role, active 
       FROM users 
       WHERE username = 'monicapalmer388' OR username = 'monicapalmer'`
    );
    
    console.log('User accounts:');
    for (const user of users.rows) {
      console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Active: ${user.active}`);
    }
    
    console.log('Password reset complete. New password: agent123');
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    // Close the pool
    pool.end();
  }
}

resetMonicaPassword();