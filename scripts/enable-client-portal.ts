import { db } from "../server/db";
import { clients } from "../shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../server/auth";

async function main() {
  // Find a client or create one if none exists
  let [client] = await db.select().from(clients).limit(1);
  
  if (!client) {
    // Create a client if none exists
    const [newClient] = await db.insert(clients).values({
      name: "Demo Client",
      email: "client@example.com",
      phone: "555-123-4567",
      company: "Demo Company",
      createdAt: new Date(),
      hasPortalAccess: true,
      username: "client", 
      password: await hashPassword("password"),
      status: "active",
      lastLogin: null
    }).returning();
    
    client = newClient;
    console.log("Created new client with portal access:", client.name);
  } else {
    // Enable portal access for existing client
    const [updatedClient] = await db
      .update(clients)
      .set({
        hasPortalAccess: true,
        username: "client",
        password: await hashPassword("password"),
        status: "active"
      })
      .where(eq(clients.id, client.id))
      .returning();
    
    client = updatedClient;
    console.log("Enabled portal access for existing client:", client.name);
  }
  
  console.log("\nClient Portal Credentials:");
  console.log("==========================");
  console.log("Username:", client.username);
  console.log("Password: password");
  console.log("\nAccess the portal at: /client-login");
}

main()
  .catch(console.error)
  .finally(() => process.exit());