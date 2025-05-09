import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useClientAuth } from "@/hooks/use-client-auth";
import { useEffect } from "react";

export default function SimpleClientLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("client");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  
  // Use the client auth hook - with console logs for debugging
  console.log("SimpleClientLogin: Using ClientAuth hook");
  const { client, loginMutation } = useClientAuth();
  console.log("SimpleClientLogin: Got client from hook:", client);
  console.log("SimpleClientLogin: Got loginMutation from hook:", loginMutation);
  const isLoading = loginMutation.isPending;
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (client) {
      console.log("SimpleClientLogin: Client authenticated, redirecting to dashboard");
      navigate("/client-dashboard");
    }
  }, [client, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log(`Attempting login with username: ${username}`);
      
      await loginMutation.mutateAsync({ 
        username, 
        password 
      });
      
      // The redirect will happen automatically in the useEffect
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "An error occurred during login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Simple Client Login</CardTitle>
          <CardDescription>
            Log in with test credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="client"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>
            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            variant="link" 
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Agent Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}