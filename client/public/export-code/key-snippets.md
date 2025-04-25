# Trellis CRM - Key Code Snippets
\n## Database Schema (shared/schema.ts)
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
  isOnline: boolean("is_online").default(false),
  lastActive: timestamp("last_active"),
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
  firstName: text("first_name"), // Added first name field
  lastName: text("last_name"), // Added last name field
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone"),
  sex: text("sex"), // 'M' or 'F'
  address: text("address"),
  city: text("city"), // Added city field
  state: text("state"), // Added state field
  zipCode: text("zip_code"), // Added zipCode field
  dateOfBirth: date("date_of_birth"), // Date field
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
  firstName: true, // Added first name field
  lastName: true, // Added last name field
  company: true,
  email: true,
  phone: true,
  sex: true, // Added sex field
  address: true,
  city: true, // Added city field
  state: true, // Added state field
  zipCode: true, // Added zipCode field
  dateOfBirth: true, // Added date of birth field
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
\n\n## Server Main Entry (server/index.ts)
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeData } from "./initialize-data";
import { initializePipelineData } from "./initialize-pipeline-data";
import { initializeCommissionData } from "./initialize-commission-data";
// Disabled lead to client sync to prevent automatic conversion
// import { syncExistingLeadsToClients } from "./sync-existing-leads-to-clients";
import { syncExistingPoliciesToClients } from "./sync-existing-policies-to-clients";
import { setupOnlineStatusCleanup } from "./online-status-cleanup";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Initialize database with sample data
    try {
      // Note: Lead-to-client sync has been disabled to prevent automatic lead conversion
      // await syncExistingLeadsToClients();
      
      // Then synchronize policies with clients to ensure proper linkage
      await syncExistingPoliciesToClients();
      
      // Initialize database with sample data
      await initializeData();
      
      // Initialize pipeline data after basic data is loaded
      await initializePipelineData();
      
      // Initialize commission data
      await initializeCommissionData();
      
      // Start the online status cleanup job
      setupOnlineStatusCleanup();
    } catch (error) {
      log(`Error initializing data: ${error}`);
    }
  });
})();
\n\n## Server Routes (server/routes.ts)
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertClientSchema, 
  insertDocumentSchema, 
  insertTaskSchema, 
  InsertTask,
  Task,
  insertQuoteSchema,
  insertMarketingCampaignSchema,
  insertCalendarEventSchema,
  InsertCalendarEvent,
  insertPipelineStageSchema,
  insertPipelineOpportunitySchema,
  insertCommissionSchema,
  insertCommunicationTemplateSchema,
  insertUserSchema,
  tasks
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { sendEmail, processTemplate, replaceAgentName } from "./email-service";
import { registerAgentLeadsPolicyRoutes } from "./routes-agents-leads-policies";
import { registerAnalyticsRoutes } from "./routes-analytics";
// Disabled lead to client synchronization to prevent automatic conversion 
// import { syncExistingLeadsToClients } from "./sync-existing-leads-to-clients";
import { setupAuth, isAuthenticated, isAdmin, isAdminOrTeamLeader, hashPassword, comparePasswords as authComparePasswords } from "./auth";
import { setupClientAuth, isAuthenticatedClient } from "./client-auth";
import { setupSimpleRegister } from "./simple-register";

// Helper function to handle calendar event updates
async function handleCalendarEventUpdates(
  updatedTask: Task, 
  originalTask: Task, 
  dateChanged: boolean, 
  timeChanged: boolean, 
  titleChanged: boolean, 
  descriptionChanged: boolean, 
  assigneeChanged: boolean
) {
  try {
    // If the task has a linked calendar event, update it
    if (updatedTask.calendarEventId && (dateChanged || timeChanged || titleChanged || descriptionChanged)) {
      console.log(`Updating calendar event ${updatedTask.calendarEventId} for task ${updatedTask.id}`);
      
      const event = await storage.getCalendarEvent(updatedTask.calendarEventId);
      if (event) {
        // Create calendar event updated data - handle null dueDate
        const dueDate = updatedTask.dueDate ? new Date(updatedTask.dueDate) : new Date();
        console.log(`Task update - dueDate: ${dueDate.toISOString()}`);
        
        // Set times based on dueTime
        let startTime, endTime;
        
        if (updatedTask.dueTime) {
          console.log(`Task update - dueTime: ${updatedTask.dueTime}`);
          const [hours, minutes] = updatedTask.dueTime.split(':').map(Number);
          
          // Create fresh Date objects to ensure we're not modifying the same object
          startTime = new Date(dueDate);
          startTime.setHours(hours, minutes, 0, 0);
          
          endTime = new Date(dueDate);
          endTime.setHours(hours + 1, minutes, 0, 0);
          
          console.log(`Task update - calculated startTime: ${startTime.toISOString()}`);
          console.log(`Task update - calculated endTime: ${endTime.toISOString()}`);
        } else {
          // Default to 9:00 AM if no time specified
          startTime = new Date(dueDate);
          startTime.setHours(9, 0, 0, 0);
          
          endTime = new Date(dueDate);
          endTime.setHours(10, 0, 0, 0);
          
          console.log(`Task update - default startTime: ${startTime.toISOString()}`);
          console.log(`Task update - default endTime: ${endTime.toISOString()}`);
        }
        
        // Update the calendar event
        const calendarUpdateData: Partial<InsertCalendarEvent> = {};
        
        if (titleChanged) {
          calendarUpdateData.title = `Task: ${updatedTask.title}`;
        }
        
        if (descriptionChanged) {
          calendarUpdateData.description = updatedTask.description || '';
        }
        
        if (dateChanged || timeChanged) {
          calendarUpdateData.startTime = startTime;
          calendarUpdateData.endTime = endTime;
        }
        
        if (assigneeChanged && updatedTask.assignedTo) {
\n\n## Client App Component (client/src/App.tsx)
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Documents from "@/pages/documents";
import Quotes from "@/pages/quotes";
import Calendar from "@/pages/calendar";
import Tasks from "@/pages/tasks";
import Marketing from "@/pages/marketing";
import Pipeline from "@/pages/pipeline";
import Commissions from "@/pages/commissions";
import Communications from "@/pages/communications";
import Sidebar from "@/components/ui/sidebar";
import MobileHeader from "@/components/ui/mobile-header";
import { useState } from "react";
// Lazy load the new pages
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "@/pages/auth-page";
import HomeRedirect from "@/components/home-redirect";
import Training from "@/pages/training";
import SimpleTraining from "@/pages/simple-training";
import EmergencyTraining from "@/pages/emergency-training";
import DirectTraining from "@/pages/direct-training";
import Analytics from "@/pages/analytics";
import Resources from "@/pages/resources";
import ResourcesVideos from "@/pages/resources-videos";
import SimpleClientLogin from "@/pages/simple-client-login";
import DirectClientLogin from "@/pages/direct-client-login";
import FinalClientTest from "@/pages/final-client-test";
import ClientDashboard from "@/pages/client-dashboard";

// Use wrapper components to handle lazy loading
const AgentsPage = () => {
  const Agents = lazy(() => import("@/pages/agents"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Agents />
    </Suspense>
  );
};

const LeadsPage = () => {
  const Leads = lazy(() => import("@/pages/leads"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Leads />
    </Suspense>
  );
};

const PoliciesPage = () => {
  const Policies = lazy(() => import("@/pages/policies"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Policies />
    </Suspense>
  );
};

const UsersPage = () => {
  const Users = lazy(() => import("@/pages/users"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Users />
    </Suspense>
  );
};

const AgentDashboardPage = () => {
  const AgentDashboard = lazy(() => import("@/pages/agent-dashboard"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <AgentDashboard />
    </Suspense>
  );
};

const AgentDetailPage = () => {
  const AgentDetail = lazy(() => import("@/pages/agent-detail"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <AgentDetail />
    </Suspense>
  );
};

const AgentEditPage = () => {
  const AgentEdit = lazy(() => import("@/pages/agent-edit"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <AgentEdit />
    </Suspense>
  );
};

const AgentProfilePage = () => {
  const AgentProfile = lazy(() => import("@/pages/agent-profile"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <AgentProfile />
    </Suspense>
  );
};

// Emergency fix for Aaron's profile editing
const EmergencyAgentEditPage = () => {
  const EmergencyAgentEdit = lazy(() => import("@/pages/emergency-agent-edit"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <EmergencyAgentEdit />
    </Suspense>
  );
};

// Agent Performance Page component
const AgentPerformancePage = () => {
  const AgentPerformance = lazy(() => import("@/pages/agent-performance"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <AgentPerformance />
    </Suspense>
  );
};

// Resources Books Page component
const ResourcesBooksPage = () => {
  const ResourcesBooks = lazy(() => import("@/pages/resources/books-fixed"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ResourcesBooks />
    </Suspense>
  );
};

// Resources Articles Page component
const ResourcesArticlesPage = () => {
  const ResourcesArticles = lazy(() => import("@/pages/resources/articles"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ResourcesArticles />
    </Suspense>
  );
};

// Article Redirect Page component
const ArticleRedirectPage = () => {
  const ArticleRedirect = lazy(() => import("@/pages/resources/article-redirect"));
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ArticleRedirect />
    </Suspense>
  );
};

// Create a ClientDetailPage component to handle lazy loading
const ClientDetailPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ClientDetail />
    </Suspense>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/clients/:id" component={ClientDetailPage} />
      <ProtectedRoute path="/clients" component={Clients} />
      <ProtectedRoute path="/documents" component={Documents} />
      <ProtectedRoute path="/quotes" component={Quotes} />
      <ProtectedRoute path="/calendar" component={Calendar} />
      <ProtectedRoute path="/tasks" component={Tasks} />
      <ProtectedRoute path="/marketing" component={Marketing} />
      <ProtectedRoute path="/pipeline" component={Pipeline} />
      <ProtectedRoute path="/commissions" component={Commissions} />
      <ProtectedRoute path="/communications" component={Communications} />
      <ProtectedRoute path="/agents" component={AgentsPage} />
      <ProtectedRoute path="/leads" component={LeadsPage} />
      <ProtectedRoute path="/policies" component={PoliciesPage} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/agent-dashboard" component={AgentDashboardPage} />
      <ProtectedRoute path="/agent-detail/:id" component={AgentDetailPage} />
      <ProtectedRoute path="/agent-edit/:id" component={AgentEditPage} />
      <ProtectedRoute path="/emergency-agent-edit/:id" component={EmergencyAgentEditPage} />
      <ProtectedRoute path="/agents/:id/performance" component={AgentPerformancePage} />
      <ProtectedRoute path="/agent-profile" component={AgentProfilePage} />
      <ProtectedRoute path="/training" component={Training} />
      <ProtectedRoute path="/simple-training" component={SimpleTraining} />
      <ProtectedRoute path="/emergency-training" component={EmergencyTraining} />
      <ProtectedRoute path="/direct-training" component={DirectTraining} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/resources" component={Resources} />
      <ProtectedRoute path="/resources/books" component={ResourcesBooksPage} />
      <ProtectedRoute path="/resources/articles" component={ResourcesArticlesPage} />
      <ProtectedRoute path="/resources/videos" component={ResourcesVideos} />
      <ProtectedRoute path="/resources/article-redirect" component={ArticleRedirectPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/client-login" component={SimpleClientLogin} />
      <Route path="/client-api-test" component={DirectClientLogin} />
      <Route path="/final-client-test" component={FinalClientTest} />
      <Route path="/client-dashboard" component={ClientDashboard} />
      <Route path="/bypass-login" component={BypassLogin} />
      <Route path="/simple-register" component={SimpleRegister} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { ClientAuthProvider } from "@/hooks/use-client-auth";

// Import our test components
import TestClientLogin from "@/pages/test-client-login";
import BypassLogin from "@/pages/bypass-login";
import SimpleRegister from "@/pages/simple-register";

// Client portal router
// Import our new client pages
import ClientLoginNew from "@/pages/client-login-new";
const ClientDashboardNew = lazy(() => import("@/pages/client-dashboard-new"));
const ClientDetail = lazy(() => import("@/pages/client-detail"));

function ClientRouter() {
  return (
    <Switch>
      <Route path="/client-login" component={SimpleClientLogin} />
      <Route path="/client-api-test" component={DirectClientLogin} />
      <Route path="/final-client-test" component={FinalClientTest} />
      <Route path="/client-dashboard" component={ClientDashboard} />
      <Route path="/simple-client-login" component={SimpleClientLogin} />
      <Route path="/direct-client-login" component={DirectClientLogin} />
      <Route path="/test-client-login" component={TestClientLogin} />
      <Route path="/bypass-login" component={BypassLogin} />
      {/* New client portal pages using React */}
      <Route path="/client-login-new" component={ClientLoginNew} />
      <Route path="/client-dashboard-new">
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <ClientDashboardNew />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Component for the client portal pages
function ClientPortalLayout() {
  return (
    <ClientAuthProvider>
      <div className="h-screen overflow-auto">
        <ClientRouter />
      </div>
    </ClientAuthProvider>
  );
}

// Component for the regular app pages
// Import our online status tracking hook
import { useOnlineStatus } from "@/hooks/use-online-status";

// Component to handle online status tracking
function OnlineStatusTracker() {
  useOnlineStatus();
  return null; // This component doesn't render anything
}

function MainAppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <AuthProvider>
      {/* OnlineStatusTracker will update user's online status periodically */}
      <OnlineStatusTracker />
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
        <div className="flex-1 overflow-auto">
          <MobileHeader onMenuClick={toggleMobileMenu} />
          <Router />
        </div>
      </div>
    </AuthProvider>
  );
}

function AppLayout() {
  const [location] = useLocation();
  
  // Check if current page is client portal page
  const isClientPortalPage = location === '/client-login' || location === '/client-dashboard' || 
    location === '/client-api-test' || location === '/final-client-test' || 
    location === '/simple-client-login' || location === '/direct-client-login' ||
    location === '/test-client-login' || location === '/client-login-new' ||
    location === '/client-dashboard-new' || location === '/bypass-login';

  return isClientPortalPage ? <ClientPortalLayout /> : <MainAppLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
\n\n## Dashboard Page (client/src/pages/dashboard.tsx)
import DashboardMetrics from "@/components/ui/dashboard-metrics";
import TaskManagement from "@/components/dashboard/task-management";
import UpdatesSection from "@/components/dashboard/updates-section";
import CalendarCard from "@/components/ui/calendar-card";
import AgentStatusList from "@/components/dashboard/agent-status-list";
import ClientList from "@/components/ui/client-list";
import { Button } from "@/components/ui/button";
import { Plus, Filter, UserPlus, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Agent {
  id: number;
  fullName: string;
  email: string;
  bankInfoExists?: boolean;
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  
  // Fetch agents with incomplete banking information
  const { data: agentsWithMissingBanking } = useQuery<Agent[]>({
    queryKey: ['/api/agents/missing-banking-info'],
    // If this API endpoint doesn't exist, the query will fail gracefully
    enabled: isAdmin // Only run this query for admin users
  });

  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600">Welcome back, {user?.fullName || "Admin"}! Here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button className="inline-flex items-center" asChild>
            <Link href="/users">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Team Member
            </Link>
          </Button>
          <Button variant="outline" className="inline-flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      {/* Admin Notifications - Check for agents with incomplete banking info */}
      {isAdmin && agentsWithMissingBanking && agentsWithMissingBanking.length > 0 && (
        <div className="mb-6">
          <Card className="border-orange-300 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-800 mb-1">Agent Banking Information Alert</h3>
                  <p className="text-orange-700 mb-2">
                    {agentsWithMissingBanking.length === 1 
                      ? "1 agent needs to complete their banking information for commission payments."
                      : `${agentsWithMissingBanking.length} agents need to complete their banking information for commission payments.`
                    }
                  </p>
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" asChild>
                    <Link href="/agents">
                      View Agents
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Dashboard Metrics */}
      <DashboardMetrics />
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <UpdatesSection />
          <TaskManagement />
          
          {/* Client List Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Clients & Assigned Agents</CardTitle>
              <CardDescription>Recent clients and their assigned agents</CardDescription>
            </CardHeader>
            <CardContent>
              <ClientList />
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/clients">
                  View All Clients
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          <CalendarCard />
          <AgentStatusList />
        </div>
      </div>
      
      {/* Modern Quote Button */}
      <div className="my-6 flex justify-center">
        <a 
          href="https://rbrokers.com/quote-and-apply/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-semibold px-12 py-4 text-xl h-auto bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full border-0"
        >
          <Plus className="mr-3 h-6 w-6" />
          QUOTE AND APPLY
        </a>
      </div>
    </div>
  );
}
\n\n## Auth Hook (client/src/hooks/use-auth.tsx)
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  isAgent: boolean;
  isTeamLeader: boolean;
  isSupport: boolean;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Determine role flags
  const isAdmin = user?.role === "admin";
  const isAgent = user?.role === "agent";
  const isTeamLeader = user?.role === "team_leader";
  const isSupport = user?.role === "support";

  const loginMutation = useMutation<SelectUser, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return response;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<SelectUser, Error, InsertUser>({
    mutationFn: async (credentials: InsertUser) => {
      console.log("Sending registration request with data:", { 
        ...credentials, 
        password: "***" // Hide password in logs
      });
      
      try {
        const response = await apiRequest("POST", "/api/register", credentials);
        console.log("Registration API response:", response);
        return response;
      } catch (error) {
        console.error("Registration API error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Registration successful:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "There was a problem creating your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out successfully",
      });
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        isAdmin,
        isAgent,
        isTeamLeader,
        isSupport,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}