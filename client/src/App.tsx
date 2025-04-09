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
const Agents = lazy(() => import("@/pages/agents"));
const Leads = lazy(() => import("@/pages/leads"));
const Policies = lazy(() => import("@/pages/policies"));

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/documents" component={Documents} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/marketing" component={Marketing} />
        <Route path="/pipeline" component={Pipeline} />
        <Route path="/commissions" component={Commissions} />
        <Route path="/communications" component={Communications} />
        <Route path="/agents" component={Agents} />
        <Route path="/leads" component={Leads} />
        <Route path="/policies" component={Policies} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
        <div className="flex-1 overflow-auto">
          <MobileHeader onMenuClick={toggleMobileMenu} />
          <Router />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
