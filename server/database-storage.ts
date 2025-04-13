import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";
import {
  users, type User, type InsertUser,
  clients, type Client, type InsertClient, 
  documents, type Document, type InsertDocument,
  tasks, type Task, type InsertTask,
  quotes, type Quote, type InsertQuote,
  marketingCampaigns, type MarketingCampaign, type InsertMarketingCampaign,
  calendarEvents, type CalendarEvent, type InsertCalendarEvent,
  pipelineStages, type PipelineStage, type InsertPipelineStage,
  pipelineOpportunities, type PipelineOpportunity, type InsertPipelineOpportunity,
  commissions, type Commission, type InsertCommission,
  communicationTemplates, type CommunicationTemplate, type InsertCommunicationTemplate,
  agents, type Agent, type InsertAgent,
  leads, type Lead, type InsertLead,
  policies, type Policy, type InsertPolicy
} from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";
import { analyticsService } from "./database-analytics";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [insertedUser] = await db.insert(users).values(user).returning();
    return insertedUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }
  
  async getClientsByAgent(agentId: number): Promise<Client[]> {
    // Get all policies associated with this agent to find client IDs
    const agentPolicies = await db
      .select({
        clientId: policies.clientId
      })
      .from(policies)
      .where(eq(policies.agentId, agentId))
      .groupBy(policies.clientId);
    
    // Extract unique client IDs
    const clientIds = agentPolicies
      .filter(policy => policy.clientId !== null)
      .map(policy => policy.clientId as number);
    
    if (clientIds.length === 0) {
      return [];
    }
    
    // Fetch clients based on these IDs
    return await db
      .select()
      .from(clients)
      .where(inArray(clients.id, clientIds));
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const [insertedClient] = await db.insert(clients).values(client).returning();
    return insertedClient;
  }
  
  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.count > 0;
  }
  
  // Documents
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }
  
  async getDocumentsByClient(clientId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.clientId, clientId));
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const [insertedDocument] = await db.insert(documents).values(document).returning();
    return insertedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.count > 0;
  }
  
  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }
  
  async getTasksByClient(clientId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.clientId, clientId));
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const [insertedTask] = await db.insert(tasks).values(task).returning();
    return insertedTask;
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.count > 0;
  }
  
  // Quotes
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes);
  }
  
  async getQuotesByClient(clientId: number): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.clientId, clientId));
  }
  
  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }
  
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [insertedQuote] = await db.insert(quotes).values(quote).returning();
    return insertedQuote;
  }
  
  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set(quoteData)
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }
  
  async deleteQuote(id: number): Promise<boolean> {
    const result = await db.delete(quotes).where(eq(quotes.id, id));
    return result.count > 0;
  }
  
  // Marketing Campaigns
  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    return await db.select().from(marketingCampaigns);
  }
  
  async getMarketingCampaign(id: number): Promise<MarketingCampaign | undefined> {
    const [campaign] = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, id));
    return campaign;
  }
  
  async createMarketingCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const [insertedCampaign] = await db.insert(marketingCampaigns).values(campaign).returning();
    return insertedCampaign;
  }
  
  async updateMarketingCampaign(id: number, campaignData: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign | undefined> {
    const [updatedCampaign] = await db
      .update(marketingCampaigns)
      .set(campaignData)
      .where(eq(marketingCampaigns.id, id))
      .returning();
    return updatedCampaign;
  }
  
  async deleteMarketingCampaign(id: number): Promise<boolean> {
    const result = await db.delete(marketingCampaigns).where(eq(marketingCampaigns.id, id));
    return result.count > 0;
  }
  
  // Calendar Events
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents);
  }
  
  async getCalendarEventsByClient(clientId: number): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.clientId, clientId));
  }
  
  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event;
  }
  
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [insertedEvent] = await db.insert(calendarEvents).values(event).returning();
    return insertedEvent;
  }
  
  async updateCalendarEvent(id: number, eventData: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(eventData)
      .where(eq(calendarEvents.id, id))
      .returning();
    return updatedEvent;
  }
  
  async deleteCalendarEvent(id: number): Promise<boolean> {
    const result = await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    return result.count > 0;
  }
  
  // Pipeline Stages
  async getPipelineStages(): Promise<PipelineStage[]> {
    return await db.select().from(pipelineStages);
  }
  
  async getPipelineStage(id: number): Promise<PipelineStage | undefined> {
    const [stage] = await db.select().from(pipelineStages).where(eq(pipelineStages.id, id));
    return stage;
  }
  
  async createPipelineStage(stage: InsertPipelineStage): Promise<PipelineStage> {
    const [insertedStage] = await db.insert(pipelineStages).values(stage).returning();
    return insertedStage;
  }
  
  async updatePipelineStage(id: number, stageData: Partial<InsertPipelineStage>): Promise<PipelineStage | undefined> {
    const [updatedStage] = await db
      .update(pipelineStages)
      .set(stageData)
      .where(eq(pipelineStages.id, id))
      .returning();
    return updatedStage;
  }
  
  async deletePipelineStage(id: number): Promise<boolean> {
    const result = await db.delete(pipelineStages).where(eq(pipelineStages.id, id));
    return result.count > 0;
  }
  
  // Pipeline Opportunities
  async getPipelineOpportunities(): Promise<PipelineOpportunity[]> {
    return await db.select().from(pipelineOpportunities);
  }
  
  async getPipelineOpportunitiesByClient(clientId: number): Promise<PipelineOpportunity[]> {
    return await db
      .select()
      .from(pipelineOpportunities)
      .where(eq(pipelineOpportunities.clientId, clientId));
  }
  
  async getPipelineOpportunitiesByStage(stageId: number): Promise<PipelineOpportunity[]> {
    return await db
      .select()
      .from(pipelineOpportunities)
      .where(eq(pipelineOpportunities.stageId, stageId));
  }
  
  async getPipelineOpportunitiesByAgent(agentId: number): Promise<PipelineOpportunity[]> {
    return await db
      .select()
      .from(pipelineOpportunities)
      .where(eq(pipelineOpportunities.agentId, agentId));
  }
  
  async getPipelineOpportunity(id: number): Promise<PipelineOpportunity | undefined> {
    const [opportunity] = await db
      .select()
      .from(pipelineOpportunities)
      .where(eq(pipelineOpportunities.id, id));
    return opportunity;
  }
  
  async createPipelineOpportunity(opportunity: InsertPipelineOpportunity): Promise<PipelineOpportunity> {
    const [insertedOpportunity] = await db
      .insert(pipelineOpportunities)
      .values(opportunity)
      .returning();
    return insertedOpportunity;
  }
  
  async updatePipelineOpportunity(id: number, opportunityData: Partial<InsertPipelineOpportunity>): Promise<PipelineOpportunity | undefined> {
    const [updatedOpportunity] = await db
      .update(pipelineOpportunities)
      .set(opportunityData)
      .where(eq(pipelineOpportunities.id, id))
      .returning();
    return updatedOpportunity;
  }
  
  async deletePipelineOpportunity(id: number): Promise<boolean> {
    const result = await db.delete(pipelineOpportunities).where(eq(pipelineOpportunities.id, id));
    return result.count > 0;
  }
  
  // Commissions
  async getCommissions(): Promise<Commission[]> {
    return await db.select().from(commissions);
  }
  
  async getCommissionsByClient(clientId: number): Promise<Commission[]> {
    return await db.select().from(commissions).where(eq(commissions.clientId, clientId));
  }
  
  async getCommissionsByBroker(brokerId: number): Promise<Commission[]> {
    return await db.select().from(commissions).where(eq(commissions.brokerId, brokerId));
  }
  
  async getCommission(id: number): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions).where(eq(commissions.id, id));
    return commission;
  }
  
  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [insertedCommission] = await db.insert(commissions).values(commission).returning();
    return insertedCommission;
  }
  
  async updateCommission(id: number, commissionData: Partial<InsertCommission>): Promise<Commission | undefined> {
    const [updatedCommission] = await db
      .update(commissions)
      .set(commissionData)
      .where(eq(commissions.id, id))
      .returning();
    return updatedCommission;
  }
  
  async deleteCommission(id: number): Promise<boolean> {
    const result = await db.delete(commissions).where(eq(commissions.id, id));
    return result.count > 0;
  }
  
  async getCommissionsStats(): Promise<{ totalCommissions: number; pendingAmount: string; paidAmount: string; commissionsByType: Record<string, number>; }> {
    // Implementation omitted for brevity - would use SQL count and sum functions
    return {
      totalCommissions: 0,
      pendingAmount: "$0",
      paidAmount: "$0",
      commissionsByType: {}
    };
  }
  
  // Communication Templates
  async getCommunicationTemplates(): Promise<CommunicationTemplate[]> {
    return await db.select().from(communicationTemplates);
  }
  
  async getCommunicationTemplatesByCategory(category: string): Promise<CommunicationTemplate[]> {
    return await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.category, category));
  }
  
  async getCommunicationTemplate(id: number): Promise<CommunicationTemplate | undefined> {
    const [template] = await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.id, id));
    return template;
  }
  
  async createCommunicationTemplate(template: InsertCommunicationTemplate): Promise<CommunicationTemplate> {
    const [insertedTemplate] = await db
      .insert(communicationTemplates)
      .values(template)
      .returning();
    return insertedTemplate;
  }
  
  async updateCommunicationTemplate(id: number, templateData: Partial<InsertCommunicationTemplate>): Promise<CommunicationTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(communicationTemplates)
      .set(templateData)
      .where(eq(communicationTemplates.id, id))
      .returning();
    return updatedTemplate;
  }
  
  async deleteCommunicationTemplate(id: number): Promise<boolean> {
    const result = await db.delete(communicationTemplates).where(eq(communicationTemplates.id, id));
    return result.count > 0;
  }
  
  // Agents
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }
  
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }
  
  async getAgentByUserId(userId: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.userId, userId));
    return agent;
  }
  
  async getAgentsByUpline(uplineAgentId: number): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.uplineAgentId, uplineAgentId));
  }
  
  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [insertedAgent] = await db.insert(agents).values(agent).returning();
    return insertedAgent;
  }
  
  async updateAgent(id: number, agentData: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [updatedAgent] = await db
      .update(agents)
      .set(agentData)
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent;
  }
  
  async deleteAgent(id: number): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return result.count > 0;
  }
  
  // Leads
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }
  
  async getLeadsByAgent(agentId: number): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.assignedAgentId, agentId));
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const [insertedLead] = await db.insert(leads).values(lead).returning();
    return insertedLead;
  }
  
  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updatedLead] = await db
      .update(leads)
      .set(leadData)
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }
  
  async deleteLead(id: number): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id));
    return result.count > 0;
  }
  
  // Policies
  async getPolicies(): Promise<Policy[]> {
    return await db.select().from(policies);
  }
  
  async getPoliciesByClient(clientId: number): Promise<Policy[]> {
    return await db.select().from(policies).where(eq(policies.clientId, clientId));
  }
  
  async getPoliciesByLead(leadId: number): Promise<Policy[]> {
    return await db.select().from(policies).where(eq(policies.leadId, leadId));
  }
  
  async getPoliciesByAgent(agentId: number): Promise<Policy[]> {
    return await db.select().from(policies).where(eq(policies.agentId, agentId));
  }
  
  async getPolicy(id: number): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy;
  }
  
  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    const [insertedPolicy] = await db.insert(policies).values(policy).returning();
    return insertedPolicy;
  }
  
  async updatePolicy(id: number, policyData: Partial<InsertPolicy>): Promise<Policy | undefined> {
    const [updatedPolicy] = await db
      .update(policies)
      .set(policyData)
      .where(eq(policies.id, id))
      .returning();
    return updatedPolicy;
  }
  
  async deletePolicy(id: number): Promise<boolean> {
    const result = await db.delete(policies).where(eq(policies.id, id));
    return result.count > 0;
  }
  
  // Dashboard Statistics
  async getDashboardStats(): Promise<{ totalClients: number; pendingQuotes: number; activeTasks: number; upcomingMeetings: number; }> {
    // Implementation omitted for brevity - would use SQL count functions
    return {
      totalClients: 0,
      pendingQuotes: 0,
      activeTasks: 0,
      upcomingMeetings: 0
    };
  }
  
  // Analytics Methods - delegate to analytics service
  async getSalesAnalytics(from: Date, to: Date) {
    return analyticsService.getSalesAnalytics(from, to);
  }
  
  async getSalesAnalyticsByAgent(agentId: number, from: Date, to: Date) {
    return analyticsService.getSalesAnalyticsByAgent(agentId, from, to);
  }
  
  async getConversionAnalytics(from: Date, to: Date) {
    return analyticsService.getConversionAnalytics(from, to);
  }
  
  async getConversionAnalyticsByAgent(agentId: number, from: Date, to: Date) {
    return analyticsService.getConversionAnalyticsByAgent(agentId, from, to);
  }
  
  async getPolicyTypeAnalytics(from: Date, to: Date) {
    return analyticsService.getPolicyTypeAnalytics(from, to);
  }
  
  async getPolicyTypeAnalyticsByAgent(agentId: number, from: Date, to: Date) {
    return analyticsService.getPolicyTypeAnalyticsByAgent(agentId, from, to);
  }
  
  async getAgentPerformanceAnalytics(from: Date, to: Date) {
    return analyticsService.getAgentPerformanceAnalytics(from, to);
  }
  
  async getAgentPerformanceAnalyticsByTeam(teamLeaderId: number, from: Date, to: Date) {
    return analyticsService.getAgentPerformanceAnalyticsByTeam(teamLeaderId, from, to);
  }
  
  async getDashboardSummaryStats(from: Date, to: Date) {
    return analyticsService.getDashboardSummaryStats(from, to);
  }
  
  async getDashboardSummaryStatsByAgent(agentId: number, from: Date, to: Date) {
    return analyticsService.getDashboardSummaryStatsByAgent(agentId, from, to);
  }
}