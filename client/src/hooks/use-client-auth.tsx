import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { Client as SelectClient } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type ClientAuthContextType = {
  client: SelectClient | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectClient, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginData = z.infer<typeof loginSchema>;

export const ClientAuthContext = createContext<ClientAuthContextType | null>(null);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: client,
    error,
    isLoading,
  } = useQuery<SelectClient | undefined, Error>({
    queryKey: ["/api/client/info"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Make a direct fetch request without using apiRequest to see raw response
      const response = await fetch("/api/client/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include" // Important: include cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return await response.json();
    },
    onSuccess: (client: SelectClient) => {
      queryClient.setQueryData(["/api/client/info"], client);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Use direct fetch instead of apiRequest
      const response = await fetch("/api/client/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include" // Important: include cookies
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/client/info"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <ClientAuthContext.Provider
      value={{
        client: client ?? null,
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