import { eq, and, inArray } from "drizzle-orm";
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
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
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

  async getClientByUsername(username: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.username, username));
    return client;
  }
  
  async getClientsByLeadId(leadId: number): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.leadId, leadId));
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
    try {
      console.log(`Attempting to delete client with id: ${id}`);
      
      // Begin a transaction to ensure all operations succeed or fail together
      await db.transaction(async (tx) => {
        console.log(`Deleting related documents for client: ${id}`);
        // Delete related documents first
        await tx.delete(documents).where(eq(documents.clientId, id));
        
        console.log(`Deleting related tasks for client: ${id}`);
        // Delete related tasks
        await tx.delete(tasks).where(eq(tasks.clientId, id));
        
        console.log(`Deleting related quotes for client: ${id}`);
        // Delete related quotes
        await tx.delete(quotes).where(eq(quotes.clientId, id));
        
        console.log(`Deleting related calendar events for client: ${id}`);
        // Delete related calendar events
        await tx.delete(calendarEvents).where(eq(calendarEvents.clientId, id));
        
        console.log(`Deleting related commissions for client: ${id}`);
        // Delete related commissions
        await tx.delete(commissions).where(eq(commissions.clientId, id));
        
        console.log(`Deleting related pipeline opportunities for client: ${id}`);
        // Delete related pipeline opportunities
        await tx.delete(pipelineOpportunities).where(eq(pipelineOpportunities.clientId, id));
        
        console.log(`Deleting related policies for client: ${id}`);
        // Delete related policies
        await tx.delete(policies).where(eq(policies.clientId, id));
        
        console.log(`Deleting client with id: ${id}`);
        // Finally delete the client
        await tx.delete(clients).where(eq(clients.id, id));
      });
      
      console.log(`Successfully deleted client with id: ${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting client with cascading deletes:", error);
      return false;
    }
  }

  async updateClientLastLogin(id: number): Promise<void> {
    await db
      .update(clients)
      .set({ lastLogin: new Date() })
      .where(eq(clients.id, id));
  }

  async enableClientPortalAccess(id: number, username: string, password: string): Promise<Client | undefined> {
    // First check if the username is already taken
    const existingClient = await this.getClientByUsername(username);
    if (existingClient && existingClient.id !== id) {
      throw new Error("Username already exists");
    }

    const [updatedClient] = await db
      .update(clients)
      .set({ 
        username,
        password, 
        hasPortalAccess: true 
      })
      .where(eq(clients.id, id))
      .returning();
    
    return updatedClient;
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
  
  async getTasksByAssignedUser(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, userId));
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
  
  async getCalendarEventsByUser(userId: number): Promise<CalendarEvent[]> {
    console.log(`[DATABASE] Fetching calendar events for user ${userId}`);
    
    // First log all calendar events to see what's in the database
    const allEvents = await db.select().from(calendarEvents);
    console.log(`[DATABASE] Total calendar events in database: ${allEvents.length}`);
    
    // Get user-specific events and log them
    const userEvents = await db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId));
    console.log(`[DATABASE] Found ${userEvents.length} events for user ${userId}`);
    
    if (userEvents.length > 0) {
      // Log first few events for debugging
      console.log(`[DATABASE] Sample events for user ${userId}:`, 
                  userEvents.slice(0, 3).map(e => ({ 
                    id: e.id, 
                    title: e.title,
                    type: e.type,
                    taskId: e.taskId
                  })));
    }
    
    return userEvents;
  }
  
  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event;
  }
  
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    // Strip out any fields that don't exist in the database
    // Extract only the fields from the actual database schema to prevent errors
    const validDbFields = {
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      clientId: event.clientId,
      createdBy: event.createdBy,
      userId: event.userId,
      type: event.type,
      taskId: event.taskId,
      // Explicitly exclude any fields that aren't in the database, like 'color'
    };
    
    console.log("Creating calendar event with sanitized data:", JSON.stringify(validDbFields));
    const [insertedEvent] = await db.insert(calendarEvents).values(validDbFields).returning();
    return insertedEvent;
  }
  
  async updateCalendarEvent(id: number, eventData: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    // Filter out any fields that don't exist in the database schema
    const validDbFields: Record<string, any> = {};
    // Only copy fields that exist in the database schema
    if ('title' in eventData) validDbFields.title = eventData.title;
    if ('description' in eventData) validDbFields.description = eventData.description;
    if ('startTime' in eventData) validDbFields.startTime = eventData.startTime;
    if ('endTime' in eventData) validDbFields.endTime = eventData.endTime;
    if ('clientId' in eventData) validDbFields.clientId = eventData.clientId;
    if ('createdBy' in eventData) validDbFields.createdBy = eventData.createdBy;
    if ('userId' in eventData) validDbFields.userId = eventData.userId;
    if ('type' in eventData) validDbFields.type = eventData.type;
    if ('taskId' in eventData) validDbFields.taskId = eventData.taskId;
    // Explicitly exclude any fields that aren't in the database, like 'color'
    
    console.log("Updating calendar event with sanitized data:", JSON.stringify(validDbFields));
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set(validDbFields)
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
      .where(eq(pipelineOpportunities.assignedTo, agentId));
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
  
  async getCommissionsStats(): Promise<{ totalCommissions: number; pendingAmount: string; paidAmount: string; commissionsByType: Record<string, number>; companyProfit: string; }> {
    // Get all commissions
    const allCommissions = await this.getCommissions();
    
    // Calculate total commissions
    const totalCommissions = allCommissions.length;
    
    // Calculate pending and paid amounts
    let pendingAmount = 0;
    let paidAmount = 0;
    
    // Group commissions by type
    const commissionsByType: Record<string, number> = {};
    
    // Calculate company profit (assuming company keeps 40% of commission)
    let totalCommissionAmount = 0;
    
    for (const commission of allCommissions) {
      // Extract numeric value from amount
      const amount = parseFloat(commission.amount.replace(/[^0-9.-]+/g, ''));
      
      if (!isNaN(amount)) {
        totalCommissionAmount += amount;
        
        if (commission.status === 'paid') {
          paidAmount += amount;
        } else if (commission.status === 'pending') {
          pendingAmount += amount;
        }
        
        // Group by type
        const type = commission.type || 'other';
        commissionsByType[type] = (commissionsByType[type] || 0) + amount;
      }
    }
    
    // Calculate company profit (40% retention rate)
    const companyProfit = totalCommissionAmount * 0.4;
    
    // Format currency values
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    };
    
    return {
      totalCommissions,
      pendingAmount: formatCurrency(pendingAmount),
      paidAmount: formatCurrency(paidAmount),
      commissionsByType,
      companyProfit: formatCurrency(companyProfit)
    };
  }
  
  async getWeeklyCommissions(): Promise<any[]> {
    // Get all commissions
    const allCommissions = await this.getCommissions();
    
    // Get all users for broker name lookup
    const allUsers = await db.select().from(users);
    
    // Filter to only paid commissions with payment dates
    const paidCommissions = allCommissions.filter(comm => 
      comm.status === 'paid' && comm.paymentDate !== null
    );
    
    // Group commissions by week
    const weeklyCommissions: Record<string, any> = {};
    
    for (const commission of paidCommissions) {
      if (!commission.paymentDate) continue;
      
      // Get the week start date (Sunday)
      const paymentDate = new Date(commission.paymentDate);
      const day = paymentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const diff = paymentDate.getDate() - day;
      const weekStart = new Date(paymentDate.setDate(diff));
      const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Extract amount
      const amount = parseFloat(commission.amount.replace(/[^0-9.-]+/g, ''));
      if (isNaN(amount)) continue;
      
      // Find broker name
      const broker = allUsers.find(user => user.id === commission.brokerId);
      const brokerName = broker ? broker.fullName : `Broker #${commission.brokerId}`;
      
      // Initialize week if not exists
      if (!weeklyCommissions[weekKey]) {
        weeklyCommissions[weekKey] = {
          weekStartDate: weekKey,
          weekLabel: `Week of ${new Date(weekKey).toLocaleDateString()}`,
          totalAmount: 0,
          companyProfit: 0,
          agentPayouts: 0,
          commissions: [],
          brokers: new Set(),
          brokerNames: []
        };
      }
      
      // Add commission to the week
      weeklyCommissions[weekKey].totalAmount += amount;
      weeklyCommissions[weekKey].companyProfit += amount * 0.4; // 40% to company
      weeklyCommissions[weekKey].agentPayouts += amount * 0.6; // 60% to agents
      weeklyCommissions[weekKey].commissions.push(commission);
      weeklyCommissions[weekKey].brokers.add(brokerName);
    }
    
    // Convert to array and sort by week (most recent first)
    const result = Object.values(weeklyCommissions).map(week => {
      // Convert Set to Array for broker names
      week.brokerNames = Array.from(week.brokers);
      delete week.brokers; // Remove the Set
      
      // Format currency values
      week.totalAmount = new Intl.NumberFormat('en-US', {
        style: 'currency', 
        currency: 'USD'
      }).format(week.totalAmount);
      
      week.companyProfit = new Intl.NumberFormat('en-US', {
        style: 'currency', 
        currency: 'USD'
      }).format(week.companyProfit);
      
      week.agentPayouts = new Intl.NumberFormat('en-US', {
        style: 'currency', 
        currency: 'USD'
      }).format(week.agentPayouts);
      
      return week;
    });
    
    // Sort by week start date (descending)
    return result.sort((a, b) => 
      new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime()
    );
  }
  
  // Get weekly commissions for a specific agent/broker
  async getWeeklyCommissionsByAgent(agentId: number): Promise<any[]> {
    // Get agent-specific commissions
    const agentCommissions = await this.getCommissionsByBroker(agentId);
    
    // Get user information for this agent
    const [agent] = await db.select().from(users).where(eq(users.id, agentId));
    const agentName = agent ? agent.fullName : `Agent #${agentId}`;
    
    // Filter to only paid commissions with payment dates
    const paidCommissions = agentCommissions.filter(comm => 
      comm.status === 'paid' && comm.paymentDate !== null
    );
    
    // Group commissions by week
    const weeklyCommissions: Record<string, any> = {};
    
    for (const commission of paidCommissions) {
      if (!commission.paymentDate) continue;
      
      // Get the week start date (Sunday)
      const paymentDate = new Date(commission.paymentDate);
      const day = paymentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const diff = paymentDate.getDate() - day;
      const weekStart = new Date(paymentDate.setDate(diff));
      const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Extract amount
      const amount = parseFloat(commission.amount.replace(/[^0-9.-]+/g, ''));
      if (isNaN(amount)) continue;
      
      // Initialize week if not exists
      if (!weeklyCommissions[weekKey]) {
        weeklyCommissions[weekKey] = {
          weekStartDate: weekKey,
          weekLabel: `Week of ${new Date(weekKey).toLocaleDateString()}`,
          totalAmount: 0,
          agentPayout: 0, // The agent's 60%
          commissions: [],
          policyTypes: new Set(),
          policyTypeList: []
        };
      }
      
      // Add commission to the week
      weeklyCommissions[weekKey].totalAmount += amount;
      weeklyCommissions[weekKey].agentPayout += amount * 0.6; // 60% to agent
      weeklyCommissions[weekKey].commissions.push(commission);
      
      // Track policy types
      if (commission.policyType) {
        weeklyCommissions[weekKey].policyTypes.add(commission.policyType);
      }
    }
    
    // Convert to array and sort by week (most recent first)
    const result = Object.values(weeklyCommissions).map(week => {
      // Convert Set to Array for policy types
      week.policyTypeList = Array.from(week.policyTypes);
      delete week.policyTypes; // Remove the Set
      
      // Format currency values
      week.totalAmount = new Intl.NumberFormat('en-US', {
        style: 'currency', 
        currency: 'USD'
      }).format(week.totalAmount);
      
      week.agentPayout = new Intl.NumberFormat('en-US', {
        style: 'currency', 
        currency: 'USD'
      }).format(week.agentPayout);
      
      // Add agent name to each week
      week.agentName = agentName;
      week.numPolicies = week.commissions.length;
      
      return week;
    });
    
    // Sort by week start date (descending)
    return result.sort((a, b) => 
      new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime()
    );
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
    // First get all agents
    const allAgents = await db.select().from(agents);
    
    // Then get all user data with fullName
    const allUsers = await db.select().from(users);
    
    // Combine the data
    return allAgents.map(agent => {
      const user = allUsers.find(u => u.id === agent.userId);
      return {
        ...agent,
        name: user?.fullName
      };
    });
  }
  
  async getAgent(id: number): Promise<(Agent & { fullName?: string; email?: string }) | undefined> {
    // Get the agent record
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    
    if (!agent) {
      return undefined;
    }
    
    // Get the associated user record to include fullName
    const [user] = await db.select().from(users).where(eq(users.id, agent.userId));
    
    if (!user) {
      return agent; // Return agent without user data if user not found
    }
    
    // Combine agent and user data
    return {
      ...agent,
      fullName: user.fullName,
      email: user.email
    };
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
    try {
      // First get the agent to check if it exists
      const [agent] = await db.select().from(agents).where(eq(agents.id, id));
      if (!agent) {
        return false;
      }

      // Get the userId from the agent record
      const userId = agent.userId;

      // First, find any agents that reference this agent as their upline
      const downlineAgents = await db.select().from(agents).where(eq(agents.uplineAgentId, id));
      
      // Update those agents to have null as their upline
      if (downlineAgents.length > 0) {
        console.log(`Updating ${downlineAgents.length} downline agents to remove reference to agent ${id}`);
        await db.update(agents)
          .set({ uplineAgentId: null })
          .where(eq(agents.uplineAgentId, id));
      }

      // Find any policies assigned to this agent
      const agentPolicies = await db.select().from(policies).where(eq(policies.agentId, id));
      
      // Update those policies to have null as their agent
      if (agentPolicies.length > 0) {
        console.log(`Updating ${agentPolicies.length} policies to remove reference to agent ${id}`);
        await db.update(policies)
          .set({ agentId: null })
          .where(eq(policies.agentId, id));
      }

      // Find any leads assigned to this agent
      const agentLeads = await db.select().from(leads).where(eq(leads.assignedAgentId, id));
      
      // Update those leads to have null as their agent
      if (agentLeads.length > 0) {
        console.log(`Updating ${agentLeads.length} leads to remove reference to agent ${id}`);
        await db.update(leads)
          .set({ assignedAgentId: null })
          .where(eq(leads.assignedAgentId, id));
      }

      // Find any clients assigned to this agent
      const agentClients = await db.select().from(clients).where(eq(clients.assignedAgentId, id));
      
      // Update those clients to have null as their agent
      if (agentClients.length > 0) {
        console.log(`Updating ${agentClients.length} clients to remove reference to agent ${id}`);
        await db.update(clients)
          .set({ assignedAgentId: null })
          .where(eq(clients.assignedAgentId, id));
      }

      // Now we can delete the agent record
      const result = await db.delete(agents).where(eq(agents.id, id));
      
      console.log(`Deleted agent with ID ${id}`);
      return result.count > 0;
    } catch (error) {
      console.error(`Error deleting agent with ID ${id}:`, error);
      return false;
    }
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