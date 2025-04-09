import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
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
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
      <div className="flex-1 overflow-auto">
        <MobileHeader onMenuClick={toggleMobileMenu} />
        <Router />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
