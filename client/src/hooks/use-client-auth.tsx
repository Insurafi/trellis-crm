import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { Client } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ClientAuthContextType = {
  client: Client | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Client, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginData = {
  username: string;
  password: string;
};

// Create a separate context for client authentication
export const ClientAuthContext = createContext<ClientAuthContextType | null>(null);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [clientData, setClientData] = useState<Client | null>(null);

  // First try to get client data from localStorage
  useEffect(() => {
    try {
      const savedClient = localStorage.getItem("clientData");
      if (savedClient) {
        setClientData(JSON.parse(savedClient));
      }
    } catch (error) {
      console.error("Error reading client data from localStorage:", error);
    }
  }, []);

  // Use React Query for client authentication state
  const {
    data: client,
    error,
    isLoading,
  } = useQuery<Client | undefined, Error>({
    queryKey: ["/api/client/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !clientData, // Only run query if we don't have client data from localStorage
    initialData: clientData || undefined,
  });

  // Client login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Try the direct client login endpoint
      const res = await apiRequest("POST", "/direct-client-login", credentials);
      const data = await res.json();
      
      // Save to localStorage for persistence
      localStorage.setItem("clientData", JSON.stringify(data));
      
      return data;
    },
    onSuccess: (clientData: Client) => {
      queryClient.setQueryData(["/api/client/user"], clientData);
      setClientData(clientData);
      toast({
        title: "Login successful",
        description: "Welcome to your client portal!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Client logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Just clear localStorage for direct login
      localStorage.removeItem("clientData");
      
      // Also try the API logout endpoint
      try {
        await apiRequest("POST", "/api/client/logout");
      } catch (error) {
        console.warn("API logout failed, but localStorage was cleared:", error);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/client/user"], null);
      setClientData(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      // Force clear client data anyway
      queryClient.setQueryData(["/api/client/user"], null);
      setClientData(null);
    },
  });

  return (
    <ClientAuthContext.Provider
      value={{
        client: clientData || client || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth must be used within a ClientAuthProvider");
  }
  return context;
}