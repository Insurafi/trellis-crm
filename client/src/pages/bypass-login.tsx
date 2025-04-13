import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export default function BypassLogin() {
  const [username, setUsername] = useState("client");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  // Test the client login endpoint using axios instead of fetch
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      console.log("Submitting login with axios:", { username, password });
      
      // First try a GET request to the client auth test endpoint
      const testResponse = await axios.get("/api/client-auth-test");
      console.log("Test response:", testResponse.data);
      
      // Then try a direct POST to /api/client/login
      const response = await axios.post("/api/client/login", 
        { username, password },
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );
      
      console.log("Login response status:", response.status);
      console.log("Login response data:", response.data);
      
      setTestResults({
        success: true,
        status: response.status,
        data: response.data
      });
      
      toast({
        title: "Login successful!",
        description: `Logged in as ${response.data.name}`,
      });
      
      // Try to get client info with axios
      try {
        const infoResponse = await axios.get("/api/client/info", { withCredentials: true });
        console.log("Client info response:", infoResponse.data);
        
        toast({
          title: "Client info fetched",
          description: `Retrieved info for ${infoResponse.data.name}`,
        });
      } catch (infoError: any) {
        console.error("Client info error:", infoError);
        toast({
          title: "Info fetch failed",
          description: infoError.message || "Could not retrieve client info",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      setTestResults({
        success: false,
        error: error.message || "An unknown error occurred",
        response: error.response?.data
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

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Axios Login Test</CardTitle>
          <CardDescription>Testing with axios instead of fetch</CardDescription>
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
          
          {testResults && (
            <div className="mt-4 p-4 rounded border border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Login Test Results:</h3>
              <pre className="text-xs overflow-auto max-h-32 bg-black text-white p-2 rounded">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button onClick={handleLogin} disabled={isLoading} className="w-full">
            {isLoading ? "Testing..." : "Test Login with Axios"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}