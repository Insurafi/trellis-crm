import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useClientAuth } from "@/hooks/use-client-auth";
import { Loader2 } from "lucide-react";

// Login form validation schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function ClientLoginNew() {
  const [_, navigate] = useLocation();
  const { client, loginMutation } = useClientAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Define form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "client", // Pre-fill with test credentials
      password: "password", // Pre-fill with test credentials
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (client) {
      navigate("/client-dashboard-new");
    }
  }, [client, navigate]);

  // Form submission handler
  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoginError(null);
      await loginMutation.mutateAsync(values);
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message || "Login failed. Please check your credentials.");
      } else {
        setLoginError("An unexpected error occurred. Please try again.");
      }
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="grid w-full gap-8 lg:grid-cols-2 lg:w-[1000px]">
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Welcome to Your Insurance Portal
            </h1>
            <p className="text-muted-foreground md:text-xl">
              Access your policies, documents, and insurance information in one secure place.
            </p>
          </div>
          <div className="space-y-4 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <div className="h-1 w-1 rounded-full bg-primary"></div>
            </div>
            <p className="text-muted-foreground">
              Your trusted insurance broker providing personalized service and protection for what matters most.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Client Portal Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
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
                          <Input placeholder="Your username" {...field} />
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
                          <Input type="password" placeholder="Your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {loginError && (
                    <div className="text-sm font-medium text-destructive px-3 py-2 bg-destructive/10 rounded-md">
                      {loginError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center space-y-2">
              <div className="text-sm text-muted-foreground">
                <span>Don't have an account? </span>
                <span className="underline cursor-pointer">Contact your agent</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Try the test account: username "client", password "password"
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}