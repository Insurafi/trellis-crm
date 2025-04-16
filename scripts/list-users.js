// Script to list all users directly from the database
import { db } from "../server/db.js";
import { users } from "../shared/schema.js";

async function listAllUsers() {
  try {
    console.log("Fetching all users from database...");
    
    const allUsers = await db.select().from(users);
    
    console.log("\n=== ALL USERS IN SYSTEM ===");
    console.log(`Total users: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Full Name: ${user.fullName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.active ? 'Yes' : 'No'}`);
    });
    
    // List admin users specifically
    const adminUsers = allUsers.filter(user => user.role === 'admin');
    console.log("\n=== ADMIN USERS ===");
    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.username} (${admin.fullName})`);
    });
    
    // List agent users specifically
    const agentUsers = allUsers.filter(user => user.role === 'agent');
    console.log("\n=== AGENT USERS ===");
    agentUsers.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.username} (${agent.fullName})`);
    });
    
  } catch (error) {
    console.error("Error listing users:", error);
  } finally {
    process.exit(0);
  }
}

listAllUsers();