import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users (brokers, agents, team leaders, and support staff)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fullName: text("full_name"), // Kept for backward compatibility
  email: text("email").notNull(),
  role: text("role").default("agent"), // Role can be: 'admin', 'agent', 'team_leader', or 'support'
  avatarUrl: text("avatar_url"),
  active: boolean("active").default(true),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  fullName: true, // Keeping for backward compatibility
  email: true,
  role: true,
  avatarUrl: true,
  active: true,
  lastLogin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Clients
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone"),
  sex: text("sex"), // 'M' or 'F'
  address: text("address"),
  status: text("status").default("active"),
  avatarUrl: text("avatar_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  // Authentication fields for client portal
  username: text("username"),
  password: text("password"),
  lastLogin: timestamp("last_login"),
  hasPortalAccess: boolean("has_portal_access").default(false),
  // Link to assigned agent and source lead
  assignedAgentId: integer("assigned_agent_id").references(() => agents.id),
  leadId: integer("lead_id"), // Reference to the original lead
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  company: true,
  email: true,
  phone: true,
  sex: true, // Added sex field
  address: true,
  status: true,
  avatarUrl: true,
  notes: true,
  username: true,
  password: true,
  hasPortalAccess: true,
  assignedAgentId: true, // Added to track the assigned agent
  leadId: true, // Added to track the source lead
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  type: text("type").notNull(), // e.g., "pdf", "doc", "xls"
  path: text("path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  name: true,
  clientId: true,
  type: true,
  path: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  clientId: integer("client_id").references(() => clients.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id), // Who created the task
  dueDate: timestamp("due_date"),
  dueTime: text("due_time"), // Store time as string in format "HH:MM"
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("pending"), // pending, completed
  completedAt: timestamp("completed_at"), // When the task was marked as completed
  createdAt: timestamp("created_at").defaultNow(),
  calendarEventId: integer("calendar_event_id"), // Reference to associated calendar event
  visibleTo: integer("visible_to").array(), // Array of user IDs who can view this task
});

// Create a base schema for the database
const baseTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  clientId: true,
  assignedTo: true,
  createdBy: true,
  dueDate: true,
  dueTime: true,
  priority: true,
  status: true,
  completedAt: true,
  calendarEventId: true,
  visibleTo: true,
});

// Create an API-friendly schema that handles date conversion properly
export const insertTaskSchema = baseTaskSchema
  .omit({ dueDate: true, completedAt: true })
  .extend({
    dueDate: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as any);
        return arg;
      },
      z.date().optional()
    ),
    completedAt: z.preprocess(
      (arg) => {
        if (arg === null) return undefined;
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as any);
        return arg;
      },
      z.date().optional()
    ),
    dueTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    createdBy: z.number().optional(),
    calendarEventId: z.number().optional(),
    visibleTo: z.array(z.number()).optional(),
  });

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Quotes
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  amount: text("amount").notNull(), // Using text to handle currency formatting
  details: json("details"),
  status: text("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  name: true,
  clientId: true,
  amount: true,
  details: true,
  status: true,
  expiresAt: true,
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

// Marketing Campaigns
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("draft"), // draft, active, completed, paused
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).pick({
  name: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
});

export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;

// Calendar Events
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  createdBy: integer("created_by").references(() => users.id),
  userId: integer("user_id").references(() => users.id), // The user this event belongs to (assignee)
  type: text("type").default("meeting"), // meeting, call, reminder, task
  taskId: integer("task_id"), // Optional reference to a task (for calendar events that are tasks)
  createdAt: timestamp("created_at").defaultNow(),
});

// Create a base schema for the database
const baseCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  clientId: true,
  createdBy: true,
  userId: true,
  type: true,
  taskId: true,
});

// Create an API-friendly schema that handles string dates properly
export const insertCalendarEventSchema = baseCalendarEventSchema
  .omit({ startTime: true, endTime: true })
  .extend({
    startTime: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as any);
        return arg;
      },
      z.date()
    ),
    endTime: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as any);
        return arg;
      },
      z.date()
    ),
    userId: z.number().optional(),
    taskId: z.number().optional(),
  });

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  calendarEvents: many(calendarEvents),
}));

export const clientsRelations = relations(clients, ({ many, one }) => ({
  documents: many(documents),
  tasks: many(tasks),
  quotes: many(quotes),
  calendarEvents: many(calendarEvents),
  assignedAgent: one(agents, {
    fields: [clients.assignedAgentId],
    references: [agents.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  client: one(clients, {
    fields: [tasks.clientId],
    references: [clients.id],
  }),
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
  calendarEvent: one(calendarEvents, {
    fields: [tasks.calendarEventId],
    references: [calendarEvents.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one, many }) => ({
  client: one(clients, {
    fields: [calendarEvents.clientId],
    references: [clients.id],
  }),
  creator: one(users, {
    fields: [calendarEvents.createdBy],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [calendarEvents.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [calendarEvents.taskId],
    references: [tasks.id],
  }),
}));

// Pipeline Stages
export const pipelineStages = pgTable("pipeline_stages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  color: text("color"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPipelineStageSchema = createInsertSchema(pipelineStages).pick({
  name: true,
  order: true,
  color: true,
  description: true,
});

export type InsertPipelineStage = z.infer<typeof insertPipelineStageSchema>;
export type PipelineStage = typeof pipelineStages.$inferSelect;

// Pipeline Opportunities
export const pipelineOpportunities = pgTable("pipeline_opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  stageId: integer("stage_id").references(() => pipelineStages.id),
  value: decimal("value", { precision: 10, scale: 2 }),
  probability: integer("probability"),  // 0-100 percentage
  expectedCloseDate: timestamp("expected_close_date"),
  assignedTo: integer("assigned_to").references(() => users.id),
  notes: text("notes"),
  status: text("status").default("active"), // active, won, lost
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPipelineOpportunitySchema = createInsertSchema(pipelineOpportunities).pick({
  title: true,
  clientId: true,
  stageId: true,
  value: true,
  probability: true,
  expectedCloseDate: true,
  assignedTo: true,
  notes: true,
  status: true,
});

export type InsertPipelineOpportunity = z.infer<typeof insertPipelineOpportunitySchema>;
export type PipelineOpportunity = typeof pipelineOpportunities.$inferSelect;

// Pipeline Relations
export const pipelineStagesRelations = relations(pipelineStages, ({ many }) => ({
  opportunities: many(pipelineOpportunities),
}));

export const pipelineOpportunitiesRelations = relations(pipelineOpportunities, ({ one }) => ({
  client: one(clients, {
    fields: [pipelineOpportunities.clientId],
    references: [clients.id],
  }),
  stage: one(pipelineStages, {
    fields: [pipelineOpportunities.stageId],
    references: [pipelineStages.id],
  }),
  assignedUser: one(users, {
    fields: [pipelineOpportunities.assignedTo],
    references: [users.id],
  }),
}));

export const clientsRelationsWithPipeline = relations(clients, ({ many, one }) => ({
  documents: many(documents),
  tasks: many(tasks),
  quotes: many(quotes),
  calendarEvents: many(calendarEvents),
  opportunities: many(pipelineOpportunities),
  commissions: many(commissions),
  assignedAgent: one(agents, {
    fields: [clients.assignedAgentId],
    references: [agents.id],
  }),
}));

// Commissions
export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  policyNumber: text("policy_number").notNull(),
  clientId: integer("client_id").references(() => clients.id),
  brokerId: integer("broker_id").references(() => users.id),
  amount: text("amount").notNull(),
  status: text("status").default("pending"),
  type: text("type").notNull(), // Initial, Renewal, etc.
  paymentDate: timestamp("payment_date"),
  policyStartDate: timestamp("policy_start_date"),
  policyEndDate: timestamp("policy_end_date"),
  carrier: text("carrier"),
  policyType: text("policy_type"), // Life, Health, Auto, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommissionSchema = createInsertSchema(commissions).pick({
  name: true,
  policyNumber: true,
  clientId: true,
  brokerId: true,
  amount: true,
  status: true,
  type: true,
  paymentDate: true,
  policyStartDate: true,
  policyEndDate: true,
  carrier: true,
  policyType: true,
  notes: true,
});

export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissions.$inferSelect;

export const commissionsRelations = relations(commissions, ({ one }) => ({
  client: one(clients, {
    fields: [commissions.clientId],
    references: [clients.id],
  }),
  broker: one(users, {
    fields: [commissions.brokerId],
    references: [users.id],
  }),
}));

export const usersCommissionsRelations = relations(users, ({ many }) => ({
  commissions: many(commissions),
}));

export const clientsCommissionsRelations = relations(clients, ({ many }) => ({
  commissions: many(commissions),
}));

// Communication Templates
export const communicationTemplates = pgTable("communication_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'call', 'email', 'sms'
  subject: text("subject"), // For email templates
  content: text("content").notNull(),
  tags: text("tags"), // Comma-separated tags for filtering
  isDefault: boolean("is_default").default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunicationTemplateSchema = createInsertSchema(communicationTemplates).pick({
  name: true,
  category: true,
  subject: true,
  content: true,
  tags: true,
  isDefault: true,
  createdBy: true,
});

export type InsertCommunicationTemplate = z.infer<typeof insertCommunicationTemplateSchema>;
export type CommunicationTemplate = typeof communicationTemplates.$inferSelect;

export const communicationTemplatesRelations = relations(communicationTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [communicationTemplates.createdBy],
    references: [users.id],
  }),
}));

export const usersTemplatesRelations = relations(users, ({ many }) => ({
  templates: many(communicationTemplates),
}));

// Agents (extending users with insurance-specific details)
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  licenseNumber: text("license_number"),
  licenseExpiration: date("license_expiration").notNull(),
  npn: text("npn"), // National Producer Number
  phoneNumber: text("phone_number").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  carrierAppointments: text("carrier_appointments"), // Comma-separated list or JSON in practice 
  uplineAgentId: integer("upline_agent_id"),
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }),
  overridePercentage: decimal("override_percentage", { precision: 5, scale: 2 }),
  specialties: text("specialties"), // Comma-separated list of specialties
  licensedStates: text("licensed_states"), // Comma-separated list of states where agent is licensed to sell
  notes: text("notes"),
  // Banking information
  bankName: text("bank_name"),
  bankAccountType: text("bank_account_type"), // "checking" or "savings"
  bankAccountNumber: text("bank_account_number"),
  bankRoutingNumber: text("bank_routing_number"),
  bankPaymentMethod: text("bank_payment_method"), // "direct_deposit", "check", etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Base schema with all fields
const baseAgentSchema = createInsertSchema(agents).pick({
  userId: true,
  licenseNumber: true,
  licenseExpiration: true,
  npn: true,
  phoneNumber: true, 
  address: true,
  city: true,
  state: true,
  zipCode: true,
  carrierAppointments: true,
  uplineAgentId: true,
  commissionPercentage: true,
  overridePercentage: true,
  specialties: true,
  licensedStates: true,
  notes: true,
  // Banking information
  bankName: true,
  bankAccountType: true,
  bankAccountNumber: true,
  bankRoutingNumber: true,
  bankPaymentMethod: true,
});

// Export the schema with extended fields and make most fields optional
export const insertAgentSchema = baseAgentSchema.extend({
  // Make most fields optional except userId for simple agent creation
  userId: baseAgentSchema.shape.userId.optional(),
  licenseNumber: baseAgentSchema.shape.licenseNumber.optional(),
  licenseExpiration: baseAgentSchema.shape.licenseExpiration.optional(),
  phoneNumber: baseAgentSchema.shape.phoneNumber.optional(),
  
  // Add these fields temporarily for form handling, they'll be processed separately
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  // Login credentials for user account creation
  username: z.string().optional(),
  password: z.string().optional(),
  email: z.string().email().optional(),
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

// Leads (prospective clients)
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  sex: text("sex"), // 'M' or 'F'
  dateOfBirth: date("date_of_birth"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  city: text("city"), // Added city field
  state: text("state"), // Added state field
  zipCode: text("zip_code"), // Added zip code field
  // Health Information
  height: text("height"), // Store as string to allow for different formats (e.g., 5'10")
  weight: text("weight"), // Store as string to allow for different formats
  smokerStatus: text("smoker_status"), // Yes, No, Former
  medicalConditions: text("medical_conditions"), // Could be comma-separated or JSON in practice
  familyHistory: text("family_history"), // Could be comma-separated or JSON in practice
  // Financial Information
  incomeRange: text("income_range"), // e.g., "50k-100k"
  existingCoverage: text("existing_coverage"), // Details about current insurance
  coverageNeeds: text("coverage_needs"), // Amount and type of coverage needed
  insuranceTypeInterest: text("insurance_type_interest"), // Term, Whole Life, Final Expense, IUL, etc.
  // Lead Management
  leadSource: text("lead_source"), // How the lead was acquired
  assignedAgentId: integer("assigned_agent_id").references(() => agents.id),
  status: text("status").default("new"), // new, contacted, qualified, proposal, closed-won, closed-lost
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastContactedAt: timestamp("last_contacted_at"),
});

// Create a base schema for leads
const baseLeadSchema = createInsertSchema(leads).pick({
  firstName: true,
  lastName: true,
  sex: true, // Added sex field
  dateOfBirth: true,
  email: true,
  phoneNumber: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  height: true,
  weight: true,
  smokerStatus: true,
  medicalConditions: true,
  familyHistory: true,
  incomeRange: true,
  existingCoverage: true,
  coverageNeeds: true,
  insuranceTypeInterest: true,
  leadSource: true,
  assignedAgentId: true,
  status: true,
  notes: true,
  lastContactedAt: true,
});

// Export a modified schema that only requires essential fields
export const insertLeadSchema = baseLeadSchema.extend({
  // Only keep these fields as required
  firstName: baseLeadSchema.shape.firstName,
  lastName: baseLeadSchema.shape.lastName,
  email: baseLeadSchema.shape.email,
  phoneNumber: baseLeadSchema.shape.phoneNumber,
  state: baseLeadSchema.shape.state,
  
  // Make all other fields optional
  sex: baseLeadSchema.shape.sex.optional(), // Make the new sex field optional
  dateOfBirth: baseLeadSchema.shape.dateOfBirth.optional(),
  address: baseLeadSchema.shape.address.optional(),
  city: baseLeadSchema.shape.city.optional(),
  zipCode: baseLeadSchema.shape.zipCode.optional(),
  height: baseLeadSchema.shape.height.optional(),
  weight: baseLeadSchema.shape.weight.optional(),
  smokerStatus: baseLeadSchema.shape.smokerStatus.optional().default("No"),
  medicalConditions: baseLeadSchema.shape.medicalConditions.optional(),
  familyHistory: baseLeadSchema.shape.familyHistory.optional(),
  incomeRange: baseLeadSchema.shape.incomeRange.optional(),
  existingCoverage: baseLeadSchema.shape.existingCoverage.optional(),
  coverageNeeds: baseLeadSchema.shape.coverageNeeds.optional(),
  insuranceTypeInterest: baseLeadSchema.shape.insuranceTypeInterest.optional(),
  leadSource: baseLeadSchema.shape.leadSource.optional().default("Website"),
  assignedAgentId: baseLeadSchema.shape.assignedAgentId.optional(),
  status: baseLeadSchema.shape.status.optional().default("new"),
  notes: baseLeadSchema.shape.notes.optional(),
  lastContactedAt: baseLeadSchema.shape.lastContactedAt.optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Policies 
export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  policyNumber: text("policy_number").notNull(),
  carrier: text("carrier").notNull(), // Insurance company
  policyType: text("policy_type").notNull(), // Term, Whole Life, Universal Life, etc.
  status: text("status").default("applied"), // Applied, Pending, Issued, In Force, Lapsed, Canceled
  faceAmount: decimal("face_amount", { precision: 15, scale: 2 }).notNull(), // Coverage amount
  premium: decimal("premium", { precision: 10, scale: 2 }).notNull(), // Payment amount
  premiumFrequency: text("premium_frequency").default("monthly"), // monthly, quarterly, annually
  applicationDate: date("application_date"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"), // For term policies
  clientId: integer("client_id").references(() => clients.id),
  leadId: integer("lead_id").references(() => leads.id),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  addRiders: json("add_riders"), // Additional coverage options
  notes: text("notes"),
  documents: json("documents"), // References to policy documents
  cashValue: decimal("cash_value", { precision: 15, scale: 2 }), // For whole/universal life
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPolicySchema = createInsertSchema(policies).pick({
  policyNumber: true,
  carrier: true,
  policyType: true,
  status: true,
  faceAmount: true,
  premium: true,
  premiumFrequency: true,
  applicationDate: true,
  issueDate: true,
  expiryDate: true,
  clientId: true,
  leadId: true,
  agentId: true,
  addRiders: true,
  notes: true,
  documents: true,
  cashValue: true,
});

export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policies.$inferSelect;

// Relations
export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  uplineAgent: one(agents, {
    fields: [agents.uplineAgentId],
    references: [agents.id],
  }),
  downlineAgents: many(agents, { relationName: "uplineAgent" }),
  leads: many(leads),
  policies: many(policies),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignedAgent: one(agents, {
    fields: [leads.assignedAgentId],
    references: [agents.id],
  }),
  policies: many(policies),
}));

export const policiesRelations = relations(policies, ({ one }) => ({
  client: one(clients, {
    fields: [policies.clientId],
    references: [clients.id],
  }),
  lead: one(leads, {
    fields: [policies.leadId],
    references: [leads.id],
  }),
  agent: one(agents, {
    fields: [policies.agentId],
    references: [agents.id],
  }),
}));

export const usersAgentsRelations = relations(users, ({ one }) => ({
  agent: one(agents, {
    fields: [users.id],
    references: [agents.userId],
  }),
}));

export const clientsPoliciesRelations = relations(clients, ({ many }) => ({
  policies: many(policies),
}));
