import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function TestClientLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("client");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  // Direct fetch login approach with no hooks involved
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    console.log("TestClientLogin: Attempting login with credentials:", {
      username,
      password
    });

    try {
      // Make a direct fetch request with explicit URL
      console.log("TestClientLogin: Making direct fetch to /api/client/login");
      const response = await fetch("/api/client/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include" // Important: include cookies
      });
      
      console.log("TestClientLogin: Login response status:", response.status);
      
      if (!response.ok) {
        const data = await response.json();
        console.error("TestClientLogin: Login error response:", data);
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();
      console.log("TestClientLogin: Login success data:", data);
      
      // Show success response
      setResponse(JSON.stringify(data, null, 2));
      
      toast({
        title: "Login successful",
        description: "You've been successfully logged in."
      });
      
      // After successful login, navigate to client dashboard
      setTimeout(() => {
        navigate("/client-dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("TestClientLogin: Login error:", err);
      setError(err?.message || "An error occurred during login");
      
      toast({
        title: "Login failed",
        description: err?.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Alternative Client Login</CardTitle>
          <CardDescription>
            Direct API test approach without authentication hooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login Directly"
              )}
            </Button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              <h3 className="font-medium">Error:</h3>
              <p>{error}</p>
            </div>
          )}
          
          {response && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
              <h3 className="font-medium">Success! Response:</h3>
              <pre className="mt-2 p-2 bg-white text-xs overflow-auto max-h-60">
                {response}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}