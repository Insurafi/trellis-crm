import { DatabaseStorage } from "./database-storage";
import { db } from "./db";
import { 
  pipelineStages, pipelineOpportunities, users, clients
} from "@shared/schema";
import { sql } from "drizzle-orm";

// Function to initialize pipeline data in the database
export async function initializePipelineData() {
  try {
    // Check if pipeline data already exists
    const [stageCount] = await db.select({ count: sql`count(*)` }).from(pipelineStages);
    
    if (stageCount.count && Number(stageCount.count) > 0) {
      console.log("Pipeline data already initialized, skipping initialization");
      return;
    }
    
    console.log("Initializing pipeline data...");
    const storage = new DatabaseStorage();
    
    // Get admin user and some clients
    const admin = await storage.getUserByUsername("admin");
    if (!admin) {
      console.log("Admin user not found, skipping pipeline initialization");
      return;
    }
    
    const clients = await storage.getClients();
    if (clients.length === 0) {
      console.log("No clients found, skipping pipeline initialization");
      return;
    }
    
    // Create pipeline stages
    const leadStage = await storage.createPipelineStage({
      name: "Lead",
      order: 1,
      color: "#6366F1", // Indigo
      description: "Initial contact or prospect who has shown interest"
    });
    
    const qualifiedStage = await storage.createPipelineStage({
      name: "Qualified",
      order: 2,
      color: "#8B5CF6", // Violet
      description: "Prospect with confirmed interest and budget"
    });
    
    const proposalStage = await storage.createPipelineStage({
      name: "Proposal",
      order: 3,
      color: "#EC4899", // Pink
      description: "Proposal has been presented to the client"
    });
    
    const negotiationStage = await storage.createPipelineStage({
      name: "Negotiation",
      order: 4,
      color: "#F97316", // Orange
      description: "Details are being finalized"
    });
    
    const closedWonStage = await storage.createPipelineStage({
      name: "Closed Won",
      order: 5,
      color: "#10B981", // Emerald
      description: "Client has signed and opportunity is won"
    });
    
    const closedLostStage = await storage.createPipelineStage({
      name: "Closed Lost",
      order: 6,
      color: "#EF4444", // Red
      description: "Opportunity has been lost"
    });
    
    // Create pipeline opportunities
    await storage.createPipelineOpportunity({
      title: "Term Life Insurance Package",
      clientId: clients[0].id,
      stageId: qualifiedStage.id,
      value: "250000",
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      assignedTo: admin.id,
      notes: "Client is interested in a policy for their family. Needs to review quotes.",
      status: "active",
    });
    
    await storage.createPipelineOpportunity({
      title: "Whole Life Insurance Premium",
      clientId: clients[1].id,
      stageId: proposalStage.id,
      value: "500000",
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      assignedTo: admin.id,
      notes: "Client is reviewing the proposal. Follow up needed next week.",
      status: "active",
    });
    
    await storage.createPipelineOpportunity({
      title: "Group Health Insurance",
      clientId: clients[2].id,
      stageId: leadStage.id,
      value: "125000",
      probability: 25,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      assignedTo: admin.id,
      notes: "Initial contact made. Need to schedule a follow-up meeting.",
      status: "active",
    });
    
    await storage.createPipelineOpportunity({
      title: "Business Liability Insurance",
      clientId: clients[0].id,
      stageId: negotiationStage.id,
      value: "75000",
      probability: 85,
      expectedCloseDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      assignedTo: admin.id,
      notes: "Client has requested minor changes to the policy terms.",
      status: "active",
    });
    
    await storage.createPipelineOpportunity({
      title: "Executive Life Insurance",
      clientId: clients[1].id,
      stageId: closedWonStage.id,
      value: "1000000",
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      assignedTo: admin.id,
      notes: "Contract signed and initial payment received.",
      status: "won",
    });
    
    await storage.createPipelineOpportunity({
      title: "Disability Insurance Policy",
      clientId: clients[2].id,
      stageId: closedLostStage.id,
      value: "50000",
      probability: 0,
      expectedCloseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      assignedTo: admin.id,
      notes: "Client went with a competitor offering lower premiums.",
      status: "lost",
    });

    console.log("Pipeline data initialization completed successfully");
  } catch (error) {
    console.error("Error initializing pipeline data:", error);
  }
}