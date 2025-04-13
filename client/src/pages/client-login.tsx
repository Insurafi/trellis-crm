import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useClientAuth } from "@/hooks/use-client-auth";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function ClientLogin() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { client, isLoading, loginMutation } = useClientAuth();
  
  // Redirect to client dashboard if already logged in
  useEffect(() => {
    if (client) {
      navigate("/client-dashboard");
    }
  }, [client, navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: LoginFormValues) {
    setError(null);
    loginMutation.mutate(values);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 p-4">
        {/* Hero Section */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-4">Insurance Client Portal</h1>
          <p className="text-lg mb-6">
            Access your insurance documents, policies, and account information in one secure place.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 mr-3">
                ✓
              </div>
              <p>View all your policy details and coverage information</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 mr-3">
                ✓
              </div>
              <p>Access and download important insurance documents</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 mr-3">
                ✓
              </div>
              <p>Track your policy status and upcoming renewals</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex flex-col justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Client Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your insurance portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <div className="text-sm font-medium text-red-500">{error}</div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center text-gray-500">
                <span>If you do not have access to the client portal, please contact your insurance agent.</span>
              </div>
              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-sm h-auto p-0"
                  onClick={() => navigate("/auth")}
                >
                  Agent Login
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}