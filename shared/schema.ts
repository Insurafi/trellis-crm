import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users (brokers)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").default("user"),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  avatarUrl: true,
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
  address: text("address"),
  status: text("status").default("active"),
  avatarUrl: text("avatar_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  company: true,
  email: true,
  phone: true,
  address: true,
  status: true,
  avatarUrl: true,
  notes: true,
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
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("pending"), // pending, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  clientId: true,
  assignedTo: true,
  dueDate: true,
  priority: true,
  status: true,
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
  type: text("type").default("meeting"), // meeting, call, reminder
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  clientId: true,
  createdBy: true,
  type: true,
});

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  calendarEvents: many(calendarEvents),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  documents: many(documents),
  tasks: many(tasks),
  quotes: many(quotes),
  calendarEvents: many(calendarEvents),
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
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  client: one(clients, {
    fields: [calendarEvents.clientId],
    references: [clients.id],
  }),
  creator: one(users, {
    fields: [calendarEvents.createdBy],
    references: [users.id],
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

export const clientsRelationsWithPipeline = relations(clients, ({ many }) => ({
  documents: many(documents),
  tasks: many(tasks),
  quotes: many(quotes),
  calendarEvents: many(calendarEvents),
  opportunities: many(pipelineOpportunities),
  commissions: many(commissions),
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
