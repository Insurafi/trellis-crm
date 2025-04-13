import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function TestClientLogin() {
  const [username, setUsername] = useState("client");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [apiTestResults, setApiTestResults] = useState<any>(null);
  const { toast } = useToast();

  // Test the client login endpoint directly
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      console.log("Submitting direct client login with:", { username, password });
      
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
      
      setTestResults({
        success: response.ok,
        status: response.status,
        data
      });
      
      if (response.ok) {
        toast({
          title: "Login successful!",
          description: `Logged in as ${data.name}`,
        });
        
        // After login, try to get client info
        fetchClientInfo();
      } else {
        toast({
          title: "Login failed",
          description: data.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setTestResults({
        success: false,
        error: error.message || "An unknown error occurred"
      });
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test the special server-side API test endpoint
  const fetchApiTest = async () => {
    try {
      const response = await fetch("/api/client-auth-test");
      const data = await response.json();
      console.log("API test results:", data);
      setApiTestResults(data);
    } catch (error: any) {
      console.error("API test error:", error);
      setApiTestResults({
        success: false,
        error: error.message || "Failed to fetch API test"
      });
    }
  };
  
  // Try to fetch client info
  const fetchClientInfo = async () => {
    try {
      const response = await fetch("/api/client/info", {
        credentials: "include"
      });
      
      console.log("Client info response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Client info data:", data);
        
        toast({
          title: "Client info fetched",
          description: `Retrieved info for ${data.name}`,
        });
      } else {
        console.error("Failed to fetch client info:", response.statusText);
        
        toast({
          title: "Info fetch failed",
          description: "Could not retrieve client info after login",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Client info error:", error);
      toast({
        title: "Info fetch error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    // Fetch the API test when component mounts
    fetchApiTest();
  }, []);

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Direct Client Login Test</CardTitle>
          <CardDescription>Testing client authentication with direct API calls</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          {apiTestResults && (
            <div className="mt-4 p-4 rounded border border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Server API Test Results:</h3>
              <pre className="text-xs overflow-auto max-h-32 bg-black text-white p-2 rounded">
                {JSON.stringify(apiTestResults, null, 2)}
              </pre>
            </div>
          )}
          
          {testResults && (
            <div className="mt-4 p-4 rounded border border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Direct Login Test Results:</h3>
              <pre className="text-xs overflow-auto max-h-32 bg-black text-white p-2 rounded">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchApiTest}>
            Run Server Test
          </Button>
          <Button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "Testing..." : "Test Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}