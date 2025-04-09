import { DatabaseStorage } from "./database-storage";
import { db } from "./db";
import { 
  users, clients, tasks, documents, 
  calendarEvents, quotes, marketingCampaigns 
} from "@shared/schema";
import { sql } from "drizzle-orm";
import { initializePipelineData } from "./initialize-pipeline-data";
import { initializeCommissionData } from "./initialize-commission-data";
import { initializeCommunicationData } from "./initialize-communication-data";

// Function to initialize sample data in the database
export async function initializeData() {
  try {
    // Check if data already exists
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    
    if (userCount.count && Number(userCount.count) > 0) {
      console.log("Data already initialized, skipping initialization");
      return;
    }
    
    console.log("Initializing sample data...");
    const storage = new DatabaseStorage();
    
    // Create demo user
    const admin = await storage.createUser({
      username: "admin",
      password: "password",
      fullName: "Alex Johnson",
      email: "alex@example.com",
      role: "Administrator",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    // Create demo clients
    const client1 = await storage.createClient({
      name: "James Wilson",
      company: "Nexus Technologies",
      email: "james@nexustech.com",
      phone: "555-123-4567",
      address: "123 Tech Blvd, San Francisco, CA",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      notes: "Key decision maker, prefers email communication"
    });

    const client2 = await storage.createClient({
      name: "Sarah Thompson",
      company: "Global Vision Inc.",
      email: "sarah@globalvision.com",
      phone: "555-987-6543",
      address: "456 Corporate Way, New York, NY",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      notes: "Interested in comprehensive life insurance packages"
    });

    const client3 = await storage.createClient({
      name: "Michael Chen",
      company: "Horizon Partners",
      email: "michael@horizonpartners.com",
      phone: "555-456-7890",
      address: "789 Partner Plaza, Chicago, IL",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      notes: "Recently expanded business, may need updated coverage"
    });

    // Create demo tasks
    await storage.createTask({
      title: "Follow up with Smith Co. about new proposal",
      description: "Check if they've reviewed the proposal and address any questions",
      clientId: client1.id,
      assignedTo: admin.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      priority: "high",
      status: "pending",
    });

    await storage.createTask({
      title: "Prepare quarterly report for executive team",
      description: "Compile data on client acquisition and retention",
      assignedTo: admin.id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      priority: "urgent",
      status: "pending",
    });

    await storage.createTask({
      title: "Update portfolio with new case studies",
      description: "Add the recent successful client stories to our portfolio",
      assignedTo: admin.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      priority: "medium",
      status: "pending",
    });

    await storage.createTask({
      title: "Schedule social media posts for next week",
      description: "Create content calendar for LinkedIn and Twitter",
      assignedTo: admin.id,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      priority: "low",
      status: "pending",
    });

    // Create demo documents
    await storage.createDocument({
      name: "Project proposal",
      clientId: client1.id,
      type: "pdf",
      path: "/documents/proposal.pdf",
    });

    await storage.createDocument({
      name: "Contract draft",
      clientId: client2.id,
      type: "doc",
      path: "/documents/contract.doc",
    });

    await storage.createDocument({
      name: "Budget breakdown",
      clientId: client3.id,
      type: "xls",
      path: "/documents/budget.xls",
    });

    // Create demo calendar events
    await storage.createCalendarEvent({
      title: "Client Onboarding Call",
      description: "Initial meeting to discuss insurance needs",
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      clientId: client1.id,
      createdBy: admin.id,
      type: "call",
    });

    await storage.createCalendarEvent({
      title: "Team Stand-up Meeting",
      description: "Weekly team sync",
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // tomorrow at 10 AM
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10.5 * 60 * 60 * 1000), // tomorrow at 10:30 AM
      createdBy: admin.id,
      type: "meeting",
    });

    await storage.createCalendarEvent({
      title: "Project Planning Session",
      description: "Plan the next quarter's initiatives",
      startTime: new Date(Date.now() + 25 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000), // day after tomorrow at 1 PM
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // day after tomorrow at 3 PM
      createdBy: admin.id,
      type: "meeting",
    });

    // Create demo quotes
    await storage.createQuote({
      name: "Term Life Insurance - Silver Package",
      clientId: client1.id,
      amount: "$250,000",
      details: { coverageTerm: "20 years", monthlyPremium: "$35", benefits: ["Death Benefit", "Conversion Option"] },
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    await storage.createQuote({
      name: "Whole Life Insurance - Premium Plan",
      clientId: client2.id,
      amount: "$500,000",
      details: { cashValue: true, monthlyPremium: "$120", benefits: ["Death Benefit", "Cash Value Accumulation", "Dividends"] },
      status: "approved",
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    });

    await storage.createMarketingCampaign({
      name: "Summer Promotion",
      description: "Special rates for family coverage during summer months",
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    });

    await storage.createMarketingCampaign({
      name: "Business Owner Outreach",
      description: "Targeted campaign for small business owners",
      status: "draft",
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) // 120 days from now
    });

    console.log("Sample data initialization completed successfully");
    
    // Initialize pipeline data
    await initializePipelineData();
    
    // Initialize commission data
    await initializeCommissionData();
    
    // Initialize communication templates
    await initializeCommunicationData();
    
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}