import {
  users, type User, type InsertUser,
  clients, type Client, type InsertClient, 
  documents, type Document, type InsertDocument,
  tasks, type Task, type InsertTask,
  quotes, type Quote, type InsertQuote,
  marketingCampaigns, type MarketingCampaign, type InsertMarketingCampaign,
  calendarEvents, type CalendarEvent, type InsertCalendarEvent,
  pipelineStages, type PipelineStage, type InsertPipelineStage,
  pipelineOpportunities, type PipelineOpportunity, type InsertPipelineOpportunity
} from "@shared/schema";
import { db } from "./db";
import { eq, gt, and, sql, count } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning();
    return !!deleted;
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return db.select().from(documents);
  }

  async getDocumentsByClient(clientId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.clientId, clientId));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();
    return !!deleted;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async getTasksByClient(clientId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.clientId, clientId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    return !!deleted;
  }

  // Quote methods
  async getQuotes(): Promise<Quote[]> {
    return db.select().from(quotes);
  }

  async getQuotesByClient(clientId: number): Promise<Quote[]> {
    return db.select().from(quotes).where(eq(quotes.clientId, clientId));
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db
      .insert(quotes)
      .values(insertQuote)
      .returning();
    return quote;
  }

  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [quote] = await db
      .update(quotes)
      .set(quoteData)
      .where(eq(quotes.id, id))
      .returning();
    return quote || undefined;
  }

  async deleteQuote(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(quotes)
      .where(eq(quotes.id, id))
      .returning();
    return !!deleted;
  }

  // Marketing Campaign methods
  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    return db.select().from(marketingCampaigns);
  }

  async getMarketingCampaign(id: number): Promise<MarketingCampaign | undefined> {
    const [campaign] = await db
      .select()
      .from(marketingCampaigns)
      .where(eq(marketingCampaigns.id, id));
    return campaign || undefined;
  }

  async createMarketingCampaign(insertCampaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const [campaign] = await db
      .insert(marketingCampaigns)
      .values(insertCampaign)
      .returning();
    return campaign;
  }

  async updateMarketingCampaign(
    id: number,
    campaignData: Partial<InsertMarketingCampaign>
  ): Promise<MarketingCampaign | undefined> {
    const [campaign] = await db
      .update(marketingCampaigns)
      .set(campaignData)
      .where(eq(marketingCampaigns.id, id))
      .returning();
    return campaign || undefined;
  }

  async deleteMarketingCampaign(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(marketingCampaigns)
      .where(eq(marketingCampaigns.id, id))
      .returning();
    return !!deleted;
  }

  // Calendar Event methods
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return db.select().from(calendarEvents);
  }

  async getCalendarEventsByClient(clientId: number): Promise<CalendarEvent[]> {
    return db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.clientId, clientId));
  }

  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, id));
    return event || undefined;
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db
      .insert(calendarEvents)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateCalendarEvent(
    id: number,
    eventData: Partial<InsertCalendarEvent>
  ): Promise<CalendarEvent | undefined> {
    const [event] = await db
      .update(calendarEvents)
      .set(eventData)
      .where(eq(calendarEvents.id, id))
      .returning();
    return event || undefined;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(calendarEvents)
      .where(eq(calendarEvents.id, id))
      .returning();
    return !!deleted;
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<{
    totalClients: number;
    pendingQuotes: number;
    activeTasks: number;
    upcomingMeetings: number;
  }> {
    const [clientCount] = await db
      .select({ count: sql`count(*)` })
      .from(clients);

    const [pendingQuotesCount] = await db
      .select({ count: sql`count(*)` })
      .from(quotes)
      .where(eq(quotes.status, "pending"));

    const [activeTasksCount] = await db
      .select({ count: sql`count(*)` })
      .from(tasks)
      .where(eq(tasks.status, "pending"));

    const [upcomingMeetingsCount] = await db
      .select({ count: sql`count(*)` })
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.type, "meeting"),
          gt(calendarEvents.startTime, new Date())
        )
      );

    return {
      totalClients: Number(clientCount?.count) || 0,
      pendingQuotes: Number(pendingQuotesCount?.count) || 0,
      activeTasks: Number(activeTasksCount?.count) || 0,
      upcomingMeetings: Number(upcomingMeetingsCount?.count) || 0,
    };
  }
  
  // Pipeline Stage methods
  async getPipelineStages(): Promise<PipelineStage[]> {
    return db.select().from(pipelineStages).orderBy(pipelineStages.order);
  }

  async getPipelineStage(id: number): Promise<PipelineStage | undefined> {
    const [stage] = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.id, id));
    return stage || undefined;
  }

  async createPipelineStage(insertStage: InsertPipelineStage): Promise<PipelineStage> {
    const [stage] = await db
      .insert(pipelineStages)
      .values(insertStage)
      .returning();
    return stage;
  }

  async updatePipelineStage(
    id: number,
    stageData: Partial<InsertPipelineStage>
  ): Promise<PipelineStage | undefined> {
    const [stage] = await db
      .update(pipelineStages)
      .set(stageData)
      .where(eq(pipelineStages.id, id))
      .returning();
    return stage || undefined;
  }

  async deletePipelineStage(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(pipelineStages)
      .where(eq(pipelineStages.id, id))
      .returning();
    return !!deleted;
  }

  // Pipeline Opportunity methods
  async getPipelineOpportunities(): Promise<PipelineOpportunity[]> {
    return db.select().from(pipelineOpportunities);
  }

  async getPipelineOpportunitiesByClient(clientId: number): Promise<PipelineOpportunity[]> {
    return db
      .select()
      .from(pipelineOpportunities)
      .where(eq(pipelineOpportunities.clientId, clientId));
  }

  async getPipelineOpportunitiesByStage(stageId: number): Promise<PipelineOpportunity[]> {
    return db
      .select()
      .from(pipelineOpportunities)
      .where(eq(pipelineOpportunities.stageId, stageId));
  }

  async getPipelineOpportunity(id: number): Promise<PipelineOpportunity | undefined> {
    const [opportunity] = await db
      .select()
      .from(pipelineOpportunities)
      .where(eq(pipelineOpportunities.id, id));
    return opportunity || undefined;
  }

  async createPipelineOpportunity(insertOpportunity: InsertPipelineOpportunity): Promise<PipelineOpportunity> {
    const [opportunity] = await db
      .insert(pipelineOpportunities)
      .values(insertOpportunity)
      .returning();
    return opportunity;
  }

  async updatePipelineOpportunity(
    id: number,
    opportunityData: Partial<InsertPipelineOpportunity>
  ): Promise<PipelineOpportunity | undefined> {
    const [opportunity] = await db
      .update(pipelineOpportunities)
      .set(opportunityData)
      .where(eq(pipelineOpportunities.id, id))
      .returning();
    return opportunity || undefined;
  }

  async deletePipelineOpportunity(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(pipelineOpportunities)
      .where(eq(pipelineOpportunities.id, id))
      .returning();
    return !!deleted;
  }
}