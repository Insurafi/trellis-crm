import { sql } from "drizzle-orm";
import { db } from "./db";
import { users } from "@shared/schema";

/**
 * Clean up online status for inactive users
 * Marks users as offline if they haven't sent a heartbeat for more than 5 minutes
 */
export async function cleanupOnlineStatus() {
  try {
    const result = await db.execute(sql`
      UPDATE users 
      SET is_online = FALSE 
      WHERE is_online = TRUE 
      AND last_active < NOW() - INTERVAL '5 minutes'
    `);
    
    // Get count from the raw result metadata (Postgres specific)
    const rowCount = (result as any).rowCount || 0;
    if (rowCount > 0) {
      console.log(`Cleaned up online status for ${rowCount} inactive users`);
    }
  } catch (error) {
    console.error("Error cleaning up online status:", error);
  }
}

/**
 * Setup scheduled job to clean up online status for inactive users
 */
export function setupOnlineStatusCleanup() {
  console.log("Setting up online status cleanup job");
  
  // Run immediately to clear any stale statuses
  cleanupOnlineStatus();
  
  // Then run every 2 minutes
  const intervalId = setInterval(cleanupOnlineStatus, 2 * 60 * 1000);
  
  return intervalId;
}