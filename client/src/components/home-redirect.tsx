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

    // If user is logged in, redirect based on role
    if (user) {
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