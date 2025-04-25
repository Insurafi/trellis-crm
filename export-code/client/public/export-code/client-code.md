# Trellis CRM - Client-Side Code
\n## Main App Component
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
\n\n## Client Routing
import { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import axios from "axios";

// Client dashboard
function ClientDashboard() {
  const [clientData, setClientData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get client data from localStorage
    const storedData = localStorage.getItem('clientData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setClientData(parsedData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error parsing stored client data:", err);
        setError("Invalid client data. Please log in again.");
        setIsLoading(false);
      }
    } else {
      setError("No client data found. Please log in again.");
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-3xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = "/client-login-new"} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {clientData?.name}</span>
            <button 
              onClick={() => {
                // Just clear localStorage and redirect
                localStorage.removeItem('clientData');
                window.location.href = "/client-login-new";
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Personal details and policies.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{clientData?.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{clientData?.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{clientData?.phone || "Not provided"}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900">{clientData?.company || "Not provided"}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Policies
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              View your active insurance policies.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <p className="text-center text-gray-500 py-10">
              Loading policies... (This is a placeholder)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple client login page
function ClientLoginNew() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("client");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check if already logged in via localStorage
    const storedData = localStorage.getItem('clientData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.id) {
          // Already logged in
          navigate("/client-dashboard-new");
        }
      } catch (err) {
        // Invalid data in localStorage, stay on login page
        localStorage.removeItem('clientData');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log(`Attempting login with username: ${username}`);
      
      // Use our direct client login endpoint instead
      const response = await axios.post(
        "/direct-client-login", 
        { username, password },
        { withCredentials: true }
      );
      
      console.log("Login successful:", response.data);
      
      // Store client data in localStorage for dashboard access
      localStorage.setItem('clientData', JSON.stringify(response.data));
      
      navigate("/client-dashboard-new");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Client Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-400 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Client portal main router
export default function ClientPortalRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/client-login-new" component={ClientLoginNew} />
        <Route path="/client-dashboard-new" component={ClientDashboard} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}\n\n## Auth Hook
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
}\n\n## Dashboard Page
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
\n\n## Clients Page
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client, insertClientSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";

// Function to calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Clients() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Attempting to delete client with ID: ${id}`);
      try {
        const response = await fetch(`/api/clients/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // For status 204 No Content or any successful response, just return the ID
        if (response.ok) {
          console.log(`Successfully deleted client ${id}`);
          return id;
        }

        // Only try to parse JSON if there's an error response with content
        const errorData = await response.json().catch(() => ({ message: "Failed to delete client" }));
        throw new Error(errorData?.message || "Failed to delete client");
      } catch (error) {
        console.error("Error deleting client:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client deleted",
        description: "The client has been successfully deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteClient = (id: number) => {
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      deleteClientMutation.mutate(id);
    }
  };

  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Extended schema for validation
  const formSchema = insertClientSchema.extend({});
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      sex: "", // Added sex field
      address: "",
      status: "active",
      notes: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/clients", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Client created",
        description: "New client has been added successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating client",
        description: error instanceof Error ? error.message : "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createClientMutation.mutate(values);
  };

  // Filter clients based on search term
  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate avatar fallback from name
  const getNameInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (error) {
    return (
      <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-neutral-900">Error Loading Clients</h2>
          <p className="text-neutral-600 mt-2">Failed to load client data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage your client relationships</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search clients..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Enter the client's information below to add them to your CRM.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <PhoneInput 
                            placeholder="123-456-7890"
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={field.disabled}
                          />
                        </FormControl>
                        <FormDescription>
                          Number will be automatically formatted with dashes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City, State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sex</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sex" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="m">Male</SelectItem>
                              <SelectItem value="f">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="lead">Lead</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="avatarUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/avatar.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional client information..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createClientMutation.isPending}
                    >
                      {createClientMutation.isPending ? "Creating..." : "Add Client"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            A list of all your clients and their key information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients && filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={client.avatarUrl} alt={client.name} />
                              <AvatarFallback>{getNameInitials(client.name)}</AvatarFallback>
                            </Avatar>
                            {client.name}
                          </div>
                        </TableCell>
                        <TableCell>{client.sex || "Not specified"}</TableCell>
                        <TableCell>
                          {client.dateOfBirth ? (
                            calculateAge(client.dateOfBirth) + " yrs"
                          ) : (
                            "Not specified"
                          )}
                        </TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone || "—"}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.status === "active" ? "bg-green-100 text-green-800" : 
                            client.status === "inactive" ? "bg-neutral-100 text-neutral-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {client.status?.charAt(0).toUpperCase() + client.status?.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 flex items-center gap-1"
                              asChild
                            >
                              <Link href={`/clients/${client.id}`}>
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Link>
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8 flex items-center gap-1"
                              onClick={() => handleDeleteClient(client.id)}
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>View Documents</DropdownMenuItem>
                                <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onSelect={() => handleDeleteClient(client.id)}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-neutral-500">
                        {searchTerm ? "No clients match your search criteria" : "No clients found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
