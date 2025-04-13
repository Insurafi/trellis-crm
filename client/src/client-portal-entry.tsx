import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import SimpleClientLogin from "./pages/simple-client-login";
import ClientDashboard from "./pages/client-dashboard";
import { Toaster } from "@/components/ui/toaster";
import "./index.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function ClientPortalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen overflow-auto">
        <Switch>
          <Route path="/" component={SimpleClientLogin} />
          <Route path="/dashboard" component={ClientDashboard} />
          <Route>
            <div className="flex items-center justify-center h-screen">
              <h2 className="text-2xl font-bold">Page Not Found</h2>
            </div>
          </Route>
        </Switch>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClientPortalApp />
  </React.StrictMode>
);