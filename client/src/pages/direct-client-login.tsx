import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function DirectClientLogin() {
  const [username, setUsername] = useState("client");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log("About to fetch from http://localhost:5000/api/client/login");
      
      // Make the request with fully qualified URL
      const response = await fetch("http://localhost:5000/api/client/login", {
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
        setResponse(JSON.stringify(data, null, 2));
        
        // Try to get client info after successful login
        const infoResponse = await fetch("http://localhost:5000/api/client/info", {
          credentials: "include"
        });
        console.log("Info response status:", infoResponse.status);
        const infoData = await infoResponse.json();
        console.log("Client info data:", infoData);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Direct Client API Test</CardTitle>
          <CardDescription>
            Test the client login API directly without any extra logic
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
                  Testing...
                </>
              ) : (
                "Test Direct API Call"
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
              <pre className="mt-2 p-2 bg-white text-xs overflow-auto">
                {response}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            This is a direct API test to verify client authentication
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}