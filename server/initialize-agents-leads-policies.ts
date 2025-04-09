import { db } from "./db";
import {
  agents,
  leads,
  policies,
  users
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// Function to initialize agent data
export async function initializeAgentData() {
  // Check if we already have agents
  const [agentCount] = await db
    .select({ count: sql`count(*)` })
    .from(agents);

  if (Number(agentCount?.count) > 0) {
    console.log("Agents data already exists, skipping initialization");
    return;
  }

  // Create a test user first if it doesn't exist
  const [userCount] = await db
    .select({ count: sql`count(*)` })
    .from(users);

  let userId = 1;
  
  if (Number(userCount?.count) === 0) {
    const [newUser] = await db
      .insert(users)
      .values({
        username: "johndoe",
        password: "password123", // In a real app, this would be hashed
        fullName: "John Doe",
        email: "john.doe@example.com",
        role: "agent"
      })
      .returning();
    
    userId = newUser.id;
  }

  // Insert sample agents one by one
  await db.insert(agents).values({
    userId: userId,
    licenseNumber: "AG12345",
    licenseExpiration: new Date(2025, 11, 31).toISOString(),
    npn: "9876543",
    phoneNumber: "555-123-4567",
    address: "123 Insurance Ave, Brokersville, CA 94000",
    carrierAppointments: "Prudential, MetLife, Northwestern Mutual",
    commissionPercentage: "75.00",
    overridePercentage: "5.00",
    specialties: "Term Life, Whole Life, Universal Life",
    notes: "Senior agent with excellent track record"
  });
  
  await db.insert(agents).values({
    userId: userId,
    licenseNumber: "AG67890",
    licenseExpiration: new Date(2025, 5, 15).toISOString(),
    npn: "1234567",
    phoneNumber: "555-987-6543",
    address: "456 Policy Blvd, Insuranceville, CA 94001",
    carrierAppointments: "AIG, Transamerica, New York Life",
    uplineAgentId: 1,
    commissionPercentage: "65.00",
    overridePercentage: "0.00",
    specialties: "Term Life, Indexed Universal Life",
    notes: "Junior agent, specializes in young professionals"
  });

  console.log("Sample agent data initialized");
}

// Function to initialize lead data
export async function initializeLeadData() {
  // Check if we already have leads
  const [leadCount] = await db
    .select({ count: sql`count(*)` })
    .from(leads);

  if (Number(leadCount?.count) > 0) {
    console.log("Leads data already exists, skipping initialization");
    return;
  }

  // Insert sample leads one by one
  await db.insert(leads).values({
    firstName: "Alice",
    lastName: "Smith",
    dateOfBirth: new Date(1985, 5, 15).toISOString(),
    email: "alice.smith@example.com",
    phoneNumber: "555-111-2222",
    address: "789 Prospect St, Leadville, CA 94002",
    height: "5'6\"",
    weight: "140 lbs",
    smokerStatus: "No",
    medicalConditions: "None",
    familyHistory: "Heart disease (father)",
    incomeRange: "75k-100k",
    existingCoverage: "Employer-provided $100k term",
    coverageNeeds: "500k term life, income protection",
    leadSource: "Website form",
    assignedAgentId: 1,
    status: "qualified",
    notes: "Interested in protecting family, has two children"
  });
  
  await db.insert(leads).values({
    firstName: "Bob",
    lastName: "Johnson",
    dateOfBirth: new Date(1975, 2, 22).toISOString(),
    email: "bob.johnson@example.com",
    phoneNumber: "555-333-4444",
    address: "101 Business Rd, Leadville, CA 94002",
    height: "5'11\"",
    weight: "190 lbs",
    smokerStatus: "Former",
    medicalConditions: "High blood pressure (controlled)",
    familyHistory: "Diabetes (mother)",
    incomeRange: "125k-150k",
    existingCoverage: "None",
    coverageNeeds: "1M term life, key person insurance",
    leadSource: "Referral",
    assignedAgentId: 2,
    status: "contacted",
    notes: "Business owner, interested in buy-sell agreement"
  });

  console.log("Sample lead data initialized");
}

// Function to initialize policy data
export async function initializePolicyData() {
  // Check if we already have policies
  const [policyCount] = await db
    .select({ count: sql`count(*)` })
    .from(policies);

  if (Number(policyCount?.count) > 0) {
    console.log("Policies data already exists, skipping initialization");
    return;
  }

  // Insert sample policies one by one
  await db.insert(policies).values({
    policyNumber: "TL-12345678",
    carrier: "Prudential",
    policyType: "Term Life",
    status: "In Force",
    faceAmount: "500000.00",
    premium: "45.00",
    premiumFrequency: "monthly",
    applicationDate: new Date(2023, 3, 10).toISOString(),
    issueDate: new Date(2023, 4, 15).toISOString(),
    expiryDate: new Date(2043, 4, 15).toISOString(),
    leadId: 1,
    agentId: 1,
    addRiders: JSON.stringify({
      childRider: true,
      accidentalDeath: true,
      waiver: false
    }),
    notes: "Standard rating, non-smoker",
    documents: JSON.stringify({
      policyContract: "TL-12345678_contract.pdf",
      application: "TL-12345678_app.pdf"
    })
  });
  
  await db.insert(policies).values({
    policyNumber: "WL-98765432",
    carrier: "Northwestern Mutual",
    policyType: "Whole Life",
    status: "Applied",
    faceAmount: "1000000.00",
    premium: "650.00",
    premiumFrequency: "monthly",
    applicationDate: new Date(2023, 10, 5).toISOString(),
    agentId: 2,
    leadId: 2,
    addRiders: JSON.stringify({
      paidUpAdditions: true,
      termRider: true,
      waiver: true
    }),
    notes: "Pending medical exam",
    documents: JSON.stringify({
      application: "WL-98765432_app.pdf",
      medicalExam: "pending"
    })
  });

  console.log("Sample policy data initialized");
}

// Main initialization function
export async function initializeAgentsLeadsPoliciesData() {
  try {
    await initializeAgentData();
    await initializeLeadData();
    await initializePolicyData();
    console.log("Agents, leads, and policies initialization complete");
  } catch (error) {
    console.error("Error initializing agents, leads, and policies data:", error);
  }
}