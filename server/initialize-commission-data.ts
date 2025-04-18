import { db } from "./db";
import { commissions, clients } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializeCommissionData() {
  try {
    // Check if we already have commissions data
    const existingCommissions = await db.select().from(commissions).limit(1);
    
    if (existingCommissions.length === 0) {
      console.log("Initializing commission data...");
      
      // First, check if clients exist in the database to avoid foreign key violations
      const validClients = await db.select().from(clients);
      
      if (validClients.length === 0) {
        console.log("No clients found in database. Cannot initialize commission data without clients.");
        return;
      }
      
      console.log(`Found ${validClients.length} clients. Creating commission data...`);
      
      // Only use client IDs that actually exist
      const clientIds = validClients.map((client) => client.id);
      const brokerId = 1; // Default broker ID
      
      // Create commissions only for existing clients
      const commissionData = [];
      
      if (clientIds.includes(1)) {
        commissionData.push({
          name: "Term Life Policy #TL-001",
          policyNumber: "TL-001-2025",
          clientId: 1,
          brokerId: brokerId,
          amount: "1250.00",
          status: "paid",
          type: "initial",
          paymentDate: new Date('2025-01-15'),
          policyStartDate: new Date('2025-01-01'),
          policyEndDate: new Date('2026-01-01'),
          carrier: "Guardian Life",
          policyType: "Term Life",
          notes: "First year commission for 20-year term policy"
        });
        
        commissionData.push({
          name: "Group Term Life #GTL-004",
          policyNumber: "GTL-004-2025",
          clientId: 1,
          brokerId: brokerId,
          amount: "3250.00",
          status: "pending",
          type: "initial",
          policyStartDate: new Date('2025-03-01'),
          policyEndDate: new Date('2026-03-01'),
          carrier: "MetLife",
          policyType: "Group Term Life",
          notes: "Initial commission for group policy covering 15 employees"
        });
      }
      
      if (clientIds.includes(2)) {
        commissionData.push({
          name: "Whole Life Policy #WL-002",
          policyNumber: "WL-002-2025",
          clientId: 2,
          brokerId: brokerId,
          amount: "2750.00",
          status: "pending",
          type: "initial",
          policyStartDate: new Date('2025-02-01'),
          policyEndDate: null,
          carrier: "Northwestern Mutual",
          policyType: "Whole Life",
          notes: "Initial commission for whole life policy"
        });
        
        commissionData.push({
          name: "Term Life Renewal #TL-005",
          policyNumber: "TL-005-2024",
          clientId: 2,
          brokerId: brokerId,
          amount: "450.00",
          status: "pending",
          type: "renewal",
          policyStartDate: new Date('2025-04-01'),
          policyEndDate: new Date('2026-04-01'),
          carrier: "Prudential",
          policyType: "Term Life",
          notes: "Renewal commission for 10-year term policy"
        });
      }
      
      if (clientIds.includes(3)) {
        commissionData.push({
          name: "Universal Life Policy #UL-003",
          policyNumber: "UL-003-2025",
          clientId: 3,
          brokerId: brokerId,
          amount: "1875.00",
          status: "paid",
          type: "initial",
          paymentDate: new Date('2025-02-28'),
          policyStartDate: new Date('2025-02-15'),
          policyEndDate: null,
          carrier: "New York Life",
          policyType: "Universal Life",
          notes: "Initial commission for universal life policy"
        });
      }
      
      // Only insert if we have valid commissions to add
      if (commissionData.length > 0) {
        await db.insert(commissions).values(commissionData);
        console.log("Commission data initialization completed successfully");
      } else {
        console.log("No valid clients found for commission data. Skipping initialization.");
      }
    } else {
      console.log("Commission data already exists, skipping initialization");
    }
  } catch (error) {
    console.error("Error initializing commission data:", error);
  }
}