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
  communicationTemplates, type CommunicationTemplate, type InsertCommunicationTemplate
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Documents
  getDocuments(): Promise<Document[]>;
  getDocumentsByClient(clientId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTasksByClient(clientId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Quotes
  getQuotes(): Promise<Quote[]>;
  getQuotesByClient(clientId: number): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;

  // Marketing Campaigns
  getMarketingCampaigns(): Promise<MarketingCampaign[]>;
  getMarketingCampaign(id: number): Promise<MarketingCampaign | undefined>;
  createMarketingCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign>;
  updateMarketingCampaign(id: number, campaign: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign | undefined>;
  deleteMarketingCampaign(id: number): Promise<boolean>;

  // Calendar Events
  getCalendarEvents(): Promise<CalendarEvent[]>;
  getCalendarEventsByClient(clientId: number): Promise<CalendarEvent[]>;
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: number): Promise<boolean>;

  // Dashboard Statistics
  getDashboardStats(): Promise<{
    totalClients: number;
    pendingQuotes: number;
    activeTasks: number;
    upcomingMeetings: number;
  }>;
  
  // Pipeline Stages
  getPipelineStages(): Promise<PipelineStage[]>;
  getPipelineStage(id: number): Promise<PipelineStage | undefined>;
  createPipelineStage(stage: InsertPipelineStage): Promise<PipelineStage>;
  updatePipelineStage(id: number, stage: Partial<InsertPipelineStage>): Promise<PipelineStage | undefined>;
  deletePipelineStage(id: number): Promise<boolean>;
  
  // Pipeline Opportunities
  getPipelineOpportunities(): Promise<PipelineOpportunity[]>;
  getPipelineOpportunitiesByClient(clientId: number): Promise<PipelineOpportunity[]>;
  getPipelineOpportunitiesByStage(stageId: number): Promise<PipelineOpportunity[]>;
  getPipelineOpportunity(id: number): Promise<PipelineOpportunity | undefined>;
  createPipelineOpportunity(opportunity: InsertPipelineOpportunity): Promise<PipelineOpportunity>;
  updatePipelineOpportunity(id: number, opportunity: Partial<InsertPipelineOpportunity>): Promise<PipelineOpportunity | undefined>;
  deletePipelineOpportunity(id: number): Promise<boolean>;
  
  // Commissions
  getCommissions(): Promise<Commission[]>;
  getCommissionsByClient(clientId: number): Promise<Commission[]>;
  getCommissionsByBroker(brokerId: number): Promise<Commission[]>;
  getCommission(id: number): Promise<Commission | undefined>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  updateCommission(id: number, commission: Partial<InsertCommission>): Promise<Commission | undefined>;
  deleteCommission(id: number): Promise<boolean>;
  getCommissionsStats(): Promise<{
    totalCommissions: number;
    pendingAmount: string;
    paidAmount: string;
    commissionsByType: Record<string, number>;
  }>;
  
  // Communication Templates
  getCommunicationTemplates(): Promise<CommunicationTemplate[]>;
  getCommunicationTemplatesByCategory(category: string): Promise<CommunicationTemplate[]>;
  getCommunicationTemplate(id: number): Promise<CommunicationTemplate | undefined>;
  createCommunicationTemplate(template: InsertCommunicationTemplate): Promise<CommunicationTemplate>;
  updateCommunicationTemplate(id: number, template: Partial<InsertCommunicationTemplate>): Promise<CommunicationTemplate | undefined>;
  deleteCommunicationTemplate(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private documents: Map<number, Document>;
  private tasks: Map<number, Task>;
  private quotes: Map<number, Quote>;
  private marketingCampaigns: Map<number, MarketingCampaign>;
  private calendarEvents: Map<number, CalendarEvent>;
  private pipelineStages: Map<number, PipelineStage>;
  private pipelineOpportunities: Map<number, PipelineOpportunity>;
  private commissions: Map<number, Commission>;
  private communicationTemplates: Map<number, CommunicationTemplate>;
  
  private userCurrentId: number;
  private clientCurrentId: number;
  private documentCurrentId: number;
  private taskCurrentId: number;
  private quoteCurrentId: number;
  private marketingCampaignCurrentId: number;
  private calendarEventCurrentId: number;
  private portfolioItemCurrentId: number;
  private reviewCurrentId: number;
  private pipelineStageCurrentId: number;
  private pipelineOpportunityCurrentId: number;
  private commissionCurrentId: number;
  private communicationTemplateCurrentId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.documents = new Map();
    this.tasks = new Map();
    this.quotes = new Map();
    this.marketingCampaigns = new Map();
    this.calendarEvents = new Map();
    this.portfolioItems = new Map();
    this.reviews = new Map();
    this.pipelineStages = new Map();
    this.pipelineOpportunities = new Map();
    this.commissions = new Map();
    this.communicationTemplates = new Map();
    
    this.userCurrentId = 1;
    this.clientCurrentId = 1;
    this.documentCurrentId = 1;
    this.taskCurrentId = 1;
    this.quoteCurrentId = 1;
    this.marketingCampaignCurrentId = 1;
    this.calendarEventCurrentId = 1;
    this.portfolioItemCurrentId = 1;
    this.reviewCurrentId = 1;
    this.pipelineStageCurrentId = 1;
    this.pipelineOpportunityCurrentId = 1;
    this.commissionCurrentId = 1;
    this.communicationTemplateCurrentId = 1;

    this.initializeData();
    this.initializeCommunicationTemplates();
  }

  private initializeData() {
    // Create demo user
    this.createUser({
      username: "admin",
      password: "password",
      fullName: "Alex Johnson",
      email: "alex@example.com",
      role: "Administrator",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    // Create demo clients
    const client1 = this.createClient({
      name: "James Wilson",
      company: "Nexus Technologies",
      email: "james@nexustech.com",
      phone: "555-123-4567",
      address: "123 Tech Blvd, San Francisco, CA",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      notes: "Key decision maker, prefers email communication"
    });

    const client2 = this.createClient({
      name: "Sarah Thompson",
      company: "Global Vision Inc.",
      email: "sarah@globalvision.com",
      phone: "555-987-6543",
      address: "456 Corporate Way, New York, NY",
      status: "active",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      notes: "Interested in comprehensive life insurance packages"
    });

    const client3 = this.createClient({
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
    this.createTask({
      title: "Follow up with Smith Co. about new proposal",
      description: "Check if they've reviewed the proposal and address any questions",
      clientId: client1.id,
      assignedTo: 1,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      priority: "high",
      status: "pending",
    });

    this.createTask({
      title: "Prepare quarterly report for executive team",
      description: "Compile data on client acquisition and retention",
      assignedTo: 1,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      priority: "urgent",
      status: "pending",
    });

    this.createTask({
      title: "Update portfolio with new case studies",
      description: "Add the recent successful client stories to our portfolio",
      assignedTo: 1,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      priority: "medium",
      status: "pending",
    });

    this.createTask({
      title: "Schedule social media posts for next week",
      description: "Create content calendar for LinkedIn and Twitter",
      assignedTo: 1,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      priority: "low",
      status: "pending",
    });

    // Create demo documents
    this.createDocument({
      name: "Project proposal",
      clientId: client1.id,
      type: "pdf",
      path: "/documents/proposal.pdf",
    });

    this.createDocument({
      name: "Contract draft",
      clientId: client2.id,
      type: "doc",
      path: "/documents/contract.doc",
    });

    this.createDocument({
      name: "Budget breakdown",
      clientId: client3.id,
      type: "xls",
      path: "/documents/budget.xls",
    });

    // Create demo calendar events
    this.createCalendarEvent({
      title: "Client Onboarding Call",
      description: "Initial meeting to discuss insurance needs",
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      clientId: client1.id,
      createdBy: 1,
      type: "call",
    });

    this.createCalendarEvent({
      title: "Team Stand-up Meeting",
      description: "Weekly team sync",
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // tomorrow at 10 AM
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10.5 * 60 * 60 * 1000), // tomorrow at 10:30 AM
      createdBy: 1,
      type: "meeting",
    });

    this.createCalendarEvent({
      title: "Project Planning Session",
      description: "Plan the next quarter's initiatives",
      startTime: new Date(Date.now() + 25 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000), // day after tomorrow at 1 PM
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // day after tomorrow at 3 PM
      createdBy: 1,
      type: "meeting",
    });

    // Create demo quotes
    this.createQuote({
      name: "Term Life Insurance - Silver Package",
      clientId: client1.id,
      amount: "$250,000",
      details: { coverageTerm: "20 years", monthlyPremium: "$35", benefits: ["Death Benefit", "Conversion Option"] },
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    this.createQuote({
      name: "Whole Life Insurance - Premium Plan",
      clientId: client2.id,
      amount: "$500,000",
      details: { cashValue: true, monthlyPremium: "$120", benefits: ["Death Benefit", "Cash Value Accumulation", "Dividends"] },
      status: "approved",
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    });

    // Create demo portfolio items
    this.createPortfolioItem({
      title: "E-commerce Website Redesign",
      description: "A complete overhaul of an outdated e-commerce platform.",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Web Design",
    });

    this.createPortfolioItem({
      title: "Finance App UI/UX Design",
      description: "Modern financial tracking app with intuitive interface design.",
      imageUrl: "https://images.unsplash.com/photo-1555421689-3f034debb7a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Mobile App",
    });

    // Create demo reviews
    this.createReview({
      clientId: client1.id,
      content: "The team delivered an exceptional website redesign that exceeded our expectations. Their attention to detail and creative approach really made our brand stand out.",
      rating: 5,
    });

    this.createReview({
      clientId: client2.id,
      content: "Great work on our marketing materials. The designs were professional and on-brand. Would have appreciated a faster turnaround time.",
      rating: 4,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientCurrentId++;
    const createdAt = new Date();
    const client: Client = { ...insertClient, id, createdAt };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...clientData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByClient(clientId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.clientId === clientId,
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentCurrentId++;
    const uploadedAt = new Date();
    const document: Document = { ...insertDocument, id, uploadedAt };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByClient(clientId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.clientId === clientId,
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskCurrentId++;
    const createdAt = new Date();
    const task: Task = { ...insertTask, id, createdAt };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Quote methods
  async getQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values());
  }

  async getQuotesByClient(clientId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(
      (quote) => quote.clientId === clientId,
    );
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.quoteCurrentId++;
    const createdAt = new Date();
    const quote: Quote = { ...insertQuote, id, createdAt };
    this.quotes.set(id, quote);
    return quote;
  }

  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const quote = this.quotes.get(id);
    if (!quote) return undefined;
    
    const updatedQuote = { ...quote, ...quoteData };
    this.quotes.set(id, updatedQuote);
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    return this.quotes.delete(id);
  }

  // Marketing Campaign methods
  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    return Array.from(this.marketingCampaigns.values());
  }

  async getMarketingCampaign(id: number): Promise<MarketingCampaign | undefined> {
    return this.marketingCampaigns.get(id);
  }

  async createMarketingCampaign(insertCampaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const id = this.marketingCampaignCurrentId++;
    const createdAt = new Date();
    const campaign: MarketingCampaign = { ...insertCampaign, id, createdAt };
    this.marketingCampaigns.set(id, campaign);
    return campaign;
  }

  async updateMarketingCampaign(id: number, campaignData: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign | undefined> {
    const campaign = this.marketingCampaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...campaignData };
    this.marketingCampaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteMarketingCampaign(id: number): Promise<boolean> {
    return this.marketingCampaigns.delete(id);
  }

  // Calendar Event methods
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values());
  }

  async getCalendarEventsByClient(clientId: number): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values()).filter(
      (event) => event.clientId === clientId,
    );
  }

  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    return this.calendarEvents.get(id);
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = this.calendarEventCurrentId++;
    const createdAt = new Date();
    const event: CalendarEvent = { ...insertEvent, id, createdAt };
    this.calendarEvents.set(id, event);
    return event;
  }

  async updateCalendarEvent(id: number, eventData: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const event = this.calendarEvents.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.calendarEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    return this.calendarEvents.delete(id);
  }

  // Portfolio Item methods
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values());
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | undefined> {
    return this.portfolioItems.get(id);
  }

  async createPortfolioItem(insertItem: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = this.portfolioItemCurrentId++;
    const createdAt = new Date();
    const item: PortfolioItem = { ...insertItem, id, createdAt };
    this.portfolioItems.set(id, item);
    return item;
  }

  async updatePortfolioItem(id: number, itemData: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const item = this.portfolioItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...itemData };
    this.portfolioItems.set(id, updatedItem);
    return updatedItem;
  }

  async deletePortfolioItem(id: number): Promise<boolean> {
    return this.portfolioItems.delete(id);
  }

  // Review methods
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async getReviewsByClient(clientId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.clientId === clientId,
    );
  }

  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++;
    const createdAt = new Date();
    const review: Review = { ...insertReview, id, createdAt };
    this.reviews.set(id, review);
    return review;
  }

  async deleteReview(id: number): Promise<boolean> {
    return this.reviews.delete(id);
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    totalClients: number;
    pendingQuotes: number;
    activeTasks: number;
    upcomingMeetings: number;
  }> {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalClients = this.clients.size;
    const pendingQuotes = Array.from(this.quotes.values()).filter(quote => quote.status === "pending").length;
    const activeTasks = Array.from(this.tasks.values()).filter(task => task.status === "pending").length;
    const upcomingMeetings = Array.from(this.calendarEvents.values()).filter(event => 
      event.startTime >= now && event.startTime <= oneWeekFromNow
    ).length;

    return {
      totalClients,
      pendingQuotes,
      activeTasks,
      upcomingMeetings
    };
  }
  
  // Communication Template initialization
  private initializeCommunicationTemplates() {
    // Call Script Templates
    this.createCommunicationTemplate({
      name: "Initial Client Consultation",
      category: "call",
      content: "Hello [Client Name], this is [Your Name] from [Your Agency]. I wanted to schedule some time to discuss your life insurance needs and how we can help protect your family's future. Are you available for a 30-minute consultation next week?",
      tags: "initial, outreach, consultation",
      isDefault: true,
      createdBy: 1,
    });

    this.createCommunicationTemplate({
      name: "Policy Renewal Reminder",
      category: "call",
      content: "Hello [Client Name], this is [Your Name] from [Your Agency]. I'm calling to remind you that your [Policy Type] insurance is up for renewal on [Renewal Date]. I'd like to schedule a quick review to make sure it still meets your needs.",
      tags: "renewal, reminder",
      isDefault: true,
      createdBy: 1,
    });

    this.createCommunicationTemplate({
      name: "Quote Follow-up",
      category: "call",
      content: "Hello [Client Name], this is [Your Name] from [Your Agency]. I'm following up on the life insurance quote I sent last week. Did you have any questions about the coverage options or pricing? I'd be happy to explain anything that wasn't clear.",
      tags: "follow-up, quote",
      isDefault: true,
      createdBy: 1,
    });

    // Email Templates
    this.createCommunicationTemplate({
      name: "Welcome Email",
      category: "email",
      subject: "Welcome to [Agency Name] - Your Partner in Protection",
      content: "Dear [Client Name],\n\nThank you for choosing [Agency Name] for your life insurance needs. We're committed to providing you with the highest level of service and finding the right protection for you and your loved ones.\n\nIn the coming days, I'll be reaching out to schedule our initial consultation. In the meantime, please feel free to contact me with any questions.\n\nBest regards,\n[Your Name]\n[Your Agency]\n[Contact Information]",
      tags: "welcome, onboarding",
      isDefault: true,
      createdBy: 1,
    });

    this.createCommunicationTemplate({
      name: "Policy Quote",
      category: "email",
      subject: "Your Customized Life Insurance Quote",
      content: "Dear [Client Name],\n\nThank you for the opportunity to help secure your family's financial future. Based on our discussion, I've prepared the following life insurance quote customized to your needs:\n\n[Quote Details]\n\nThis plan offers [Key Benefits]. The premium is [Premium Amount] paid [Payment Frequency].\n\nPlease review this information, and feel free to contact me with any questions. I'm available to schedule a follow-up call to discuss this quote in more detail.\n\nBest regards,\n[Your Name]\n[Your Agency]\n[Contact Information]",
      tags: "quote, proposal",
      isDefault: true,
      createdBy: 1,
    });

    this.createCommunicationTemplate({
      name: "Policy Issue Confirmation",
      category: "email",
      subject: "Your Life Insurance Policy Has Been Issued",
      content: "Dear [Client Name],\n\nGreat news! Your [Policy Type] insurance policy has been issued by [Insurance Carrier]. Your policy number is [Policy Number].\n\nI've attached a digital copy of your policy documents for your records. Physical copies will be mailed to you within 7-10 business days.\n\nHere's a quick summary of your coverage:\n- Policy Type: [Policy Type]\n- Coverage Amount: [Coverage Amount]\n- Premium: [Premium Amount] paid [Payment Frequency]\n- Effective Date: [Effective Date]\n\nPlease review all documents carefully. If you have any questions or notice any discrepancies, please contact me right away.\n\nThank you for trusting us with your insurance needs.\n\nBest regards,\n[Your Name]\n[Your Agency]\n[Contact Information]",
      tags: "policy, confirmation",
      isDefault: true,
      createdBy: 1,
    });

    // SMS Templates
    this.createCommunicationTemplate({
      name: "Appointment Reminder",
      category: "sms",
      content: "Hi [Client Name], this is a reminder about your appointment with [Your Name] at [Your Agency] tomorrow at [Time]. Please call [Phone Number] if you need to reschedule.",
      tags: "appointment, reminder",
      isDefault: true,
      createdBy: 1,
    });

    this.createCommunicationTemplate({
      name: "Premium Payment Reminder",
      category: "sms",
      content: "Hi [Client Name], this is a friendly reminder that your [Policy Type] insurance premium payment of [Amount] is due on [Due Date]. Please contact us at [Phone Number] with any questions.",
      tags: "payment, reminder",
      isDefault: true,
      createdBy: 1,
    });

    this.createCommunicationTemplate({
      name: "Thank You Message",
      category: "sms",
      content: "Thank you for meeting with me today, [Client Name]. If you have any additional questions about your insurance options, please don't hesitate to reach out.",
      tags: "thanks, follow-up",
      isDefault: true,
      createdBy: 1,
    });
  }

  // Communication Template methods
  async getCommunicationTemplates(): Promise<CommunicationTemplate[]> {
    return Array.from(this.communicationTemplates.values());
  }

  async getCommunicationTemplatesByCategory(category: string): Promise<CommunicationTemplate[]> {
    return Array.from(this.communicationTemplates.values()).filter(
      (template) => template.category === category
    );
  }

  async getCommunicationTemplate(id: number): Promise<CommunicationTemplate | undefined> {
    return this.communicationTemplates.get(id);
  }

  async createCommunicationTemplate(insertTemplate: InsertCommunicationTemplate): Promise<CommunicationTemplate> {
    const id = this.communicationTemplateCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const template: CommunicationTemplate = { ...insertTemplate, id, createdAt, updatedAt };
    this.communicationTemplates.set(id, template);
    return template;
  }

  async updateCommunicationTemplate(id: number, templateData: Partial<InsertCommunicationTemplate>): Promise<CommunicationTemplate | undefined> {
    const template = this.communicationTemplates.get(id);
    if (!template) return undefined;
    
    const updatedAt = new Date();
    const updatedTemplate = { ...template, ...templateData, updatedAt };
    this.communicationTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteCommunicationTemplate(id: number): Promise<boolean> {
    return this.communicationTemplates.delete(id);
  }
}

import { DatabaseStorage } from "./database-storage";

// Export the storage instance
export const storage = new DatabaseStorage();
