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
import DownloadPage from "@/pages/download-page";

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
      <Route path="/download" component={DownloadPage} />
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
