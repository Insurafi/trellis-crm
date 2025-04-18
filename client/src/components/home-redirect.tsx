import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// This component redirects users to the appropriate dashboard based on their role
export default function HomeRedirect() {
  const [, setLocation] = useLocation();
  const { user, isAgent, isLoading } = useAuth();

  useEffect(() => {
    // Wait until auth is loaded
    if (isLoading) return;

    // If user is logged in, redirect based on role and ID
    if (user) {
      // Special case for Aaron (agent with user ID 13)
      if (user.id === 13) {
        // Redirect Aaron specifically to his emergency edit page
        const agentQuery = fetch('/api/agents/by-user').then(r => r.json());
        agentQuery.then(agent => {
          console.log("Redirecting Aaron to emergency page", agent);
          if (agent && agent.id) {
            setLocation(`/emergency-agent-edit/${agent.id}`);
          } else {
            setLocation("/agent-dashboard");
          }
        }).catch(() => {
          setLocation("/agent-dashboard");
        });
        return;
      }
      
      // Normal flow for other users
      if (isAgent) {
        setLocation("/agent-dashboard");
      } else {
        // Admin, team leader, and support users go to main dashboard
        setLocation("/dashboard");
      }
    } else {
      // Not logged in, go to auth page
      setLocation("/auth");
    }
  }, [user, isAgent, isLoading, setLocation]);

  // Show loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full"></div>
    </div>
  );
}