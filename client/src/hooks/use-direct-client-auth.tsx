import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Basic type for client objects
export interface Client {
  id: number;
  username: string;
  name: string;
  email: string;
  isClient: boolean;
  [key: string]: any; // Allow additional properties
}

// Hook for direct client authentication without using react-query
export function useDirectClientAuth() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check if already logged in
  const checkLoginStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/client/info", {
        credentials: "include"
      });
      
      if (response.ok) {
        const clientData = await response.json();
        setClient(clientData);
        return true;
      } else {
        setClient(null);
        return false;
      }
    } catch (err) {
      console.error("Error checking login status:", err);
      setClient(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log("Sending login request to /api/client/login");
      const response = await fetch("/api/client/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      
      console.log("Login response status:", response.status);
      
      const data = await response.json();
      console.log("Login response data:", data);
      
      if (response.ok) {
        setClient(data);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        return true;
      } else {
        setError(data.message || "Login failed");
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Please check your credentials and try again",
        });
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/client/logout", {
        method: "POST",
        credentials: "include"
      });
      
      if (response.ok) {
        setClient(null);
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        navigate("/client-login");
      } else {
        toast({
          variant: "destructive",
          title: "Logout failed",
          description: "There was an issue logging you out. Please try again.",
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        variant: "destructive",
        title: "Logout error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    client,
    isLoading,
    error,
    login,
    logout,
    checkLoginStatus
  };
}