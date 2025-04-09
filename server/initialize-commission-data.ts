import { db } from "./db";
import { commissions } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializeCommissionData() {
  // Check if we already have commissions data
  const existingCommissions = await db.select().from(commissions).limit(1);
  
  if (existingCommissions.length === 0) {
    console.log("Initializing commission data...");
    
    // Add sample commission data
    await db.insert(commissions).values([
      {
        name: "Term Life Policy #TL-001",
        policyNumber: "TL-001-2025",
        clientId: 1, // James Wilson
        brokerId: 1, // Alex Johnson
        amount: "1250.00",
        status: "paid",
        type: "initial",
        paymentDate: new Date('2025-01-15'),
        policyStartDate: new Date('2025-01-01'),
        policyEndDate: new Date('2026-01-01'),
        carrier: "Guardian Life",
        policyType: "Term Life",
        notes: "First year commission for 20-year term policy"
      },
      {
        name: "Whole Life Policy #WL-002",
        policyNumber: "WL-002-2025",
        clientId: 2, // Sarah Thompson
        brokerId: 1, // Alex Johnson
        amount: "2750.00",
        status: "pending",
        type: "initial",
        policyStartDate: new Date('2025-02-01'),
        policyEndDate: null,
        carrier: "Northwestern Mutual",
        policyType: "Whole Life",
        notes: "Initial commission for whole life policy"
      },
      {
        name: "Universal Life Policy #UL-003",
        policyNumber: "UL-003-2025",
        clientId: 3, // Michael Chen
        brokerId: 1, // Alex Johnson
        amount: "1875.00",
        status: "paid",
        type: "initial",
        paymentDate: new Date('2025-02-28'),
        policyStartDate: new Date('2025-02-15'),
        policyEndDate: null,
        carrier: "New York Life",
        policyType: "Universal Life",
        notes: "Initial commission for universal life policy"
      },
      {
        name: "Group Term Life #GTL-004",
        policyNumber: "GTL-004-2025",
        clientId: 1, // James Wilson
        brokerId: 1, // Alex Johnson
        amount: "3250.00",
        status: "pending",
        type: "initial",
        policyStartDate: new Date('2025-03-01'),
        policyEndDate: new Date('2026-03-01'),
        carrier: "MetLife",
        policyType: "Group Term Life",
        notes: "Initial commission for group policy covering 15 employees"
      },
      {
        name: "Term Life Renewal #TL-005",
        policyNumber: "TL-005-2024",
        clientId: 2, // Sarah Thompson
        brokerId: 1, // Alex Johnson
        amount: "450.00",
        status: "pending",
        type: "renewal",
        policyStartDate: new Date('2025-04-01'),
        policyEndDate: new Date('2026-04-01'),
        carrier: "Prudential",
        policyType: "Term Life",
        notes: "Renewal commission for 10-year term policy"
      }
    ]);
    
    console.log("Commission data initialization completed successfully");
  } else {
    console.log("Commission data already exists, skipping initialization");
  }
}