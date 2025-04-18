import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Loader2, 
  Save,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Agent form schema
const agentFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiration: z.string().min(1, "License expiration is required"),
  npn: z.string().nullable(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zipCode: z.string().nullable(),
  carrierAppointments: z.string().nullable(),
  uplineAgentId: z.number().nullable(),
  commissionPercentage: z.string().nullable(),
  overridePercentage: z.string().nullable(),
  specialties: z.string().nullable(),
  notes: z.string().nullable(),
  licensedStates: z.string().nullable(),
  // Banking information fields
  bankName: z.string().nullable(),
  bankAccountType: z.string().nullable(),
  bankAccountNumber: z.string().nullable(),
  bankRoutingNumber: z.string().nullable(),
  bankPaymentMethod: z.string().nullable(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

export default function AgentEdit() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch agent data
  const { data: agent, isLoading } = useQuery({
    queryKey: [`/api/agent-data/${id}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/agent-data/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch agent data");
        }
        const data = await response.json();
        console.log("Loaded agent data:", data);
        return data;
      } catch (error) {
        console.error("Error fetching agent:", error);
        setError("Could not load agent data. Please try again later.");
        throw error;
      }
    }
  });

  // Initialize form
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      licenseNumber: "",
      licenseExpiration: "",
      npn: null,
      phoneNumber: "",
      address: null,
      city: null,
      state: null,
      zipCode: null,
      carrierAppointments: null,
      uplineAgentId: null,
      commissionPercentage: null,
      overridePercentage: null,
      specialties: null,
      notes: null,
      licensedStates: null,
      // Banking information default values
      bankName: null,
      bankAccountType: null,
      bankAccountNumber: null,
      bankRoutingNumber: null,
      bankPaymentMethod: null,
    },
  });

  // Update form values when agent data is loaded
  useEffect(() => {
    if (agent) {
      // Pre-populate form with agent data
      if (agent.fullName) {
        const nameParts = agent.fullName.split(' ');
        if (nameParts.length >= 2) {
          form.setValue("firstName", nameParts[0]);
          form.setValue("lastName", nameParts.slice(1).join(' '));
        } else if (nameParts.length === 1) {
          form.setValue("firstName", nameParts[0]);
          form.setValue("lastName", "");
        }
      } else if (agent.name) {
        const nameParts = agent.name.split(' ');
        if (nameParts.length >= 2) {
          form.setValue("firstName", nameParts[0]);
          form.setValue("lastName", nameParts.slice(1).join(' '));
        } else if (nameParts.length === 1) {
          form.setValue("firstName", nameParts[0]);
          form.setValue("lastName", "");
        }
      }
      
      // Set other form values from agent data
      form.setValue("licenseNumber", agent.licenseNumber || "");
      form.setValue("licenseExpiration", agent.licenseExpiration || "");
      form.setValue("npn", agent.npn || null);
      form.setValue("phoneNumber", agent.phoneNumber || "");
      form.setValue("address", agent.address || null);
      form.setValue("city", agent.city || null);
      form.setValue("state", agent.state || null);
      form.setValue("zipCode", agent.zipCode || null);
      form.setValue("carrierAppointments", agent.carrierAppointments || null);
      form.setValue("uplineAgentId", agent.uplineAgentId || null);
      form.setValue("commissionPercentage", agent.commissionPercentage || null);
      form.setValue("overridePercentage", agent.overridePercentage || null);
      form.setValue("specialties", agent.specialties || null);
      form.setValue("notes", agent.notes || null);
      form.setValue("licensedStates", agent.licensedStates || null);
      
      // Set banking information values
      form.setValue("bankName", agent.bankName || null);
      form.setValue("bankAccountType", agent.bankAccountType || null);
      form.setValue("bankAccountNumber", agent.bankAccountNumber || null);
      form.setValue("bankRoutingNumber", agent.bankRoutingNumber || null);
      form.setValue("bankPaymentMethod", "Direct Deposit");
    }
  }, [agent, form]);

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async (data: AgentFormValues) => {
      setIsSubmitting(true);
      try {
        // The apiRequest function already returns the parsed JSON data
        const response = await apiRequest("PATCH", `/api/agents/${id}`, data);
        return response;
      } catch (error: any) {
        console.error("Error updating agent:", error);
        throw new Error(error.message || "Failed to update agent");
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Agent updated",
        description: "Agent information has been successfully updated.",
        variant: "default",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/agent-data/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      // Navigate back to agent detail page
      navigate(`/agent-detail/${id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update agent information. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: AgentFormValues) => {
    updateAgentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading agent information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-5xl">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <Button onClick={() => navigate(`/agents`)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agents
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Edit Agent</h2>
          <p className="text-muted-foreground">Update agent information and details</p>
        </div>
        <Button onClick={() => navigate(`/agent-detail/${id}`)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agent
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic information about the agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialties</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Term Life, Whole Life, etc." 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Separate with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>License Information</CardTitle>
              <CardDescription>
                Agent's license and certification details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="License #" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseExpiration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Expiration</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="npn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPN Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="National Producer Number" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licensedStates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Licensed States</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="CA, NY, TX" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Separate state codes with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="carrierAppointments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrier Appointments</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Prudential, Pacific Life, etc." 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>
                Agent's contact address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123 Main St" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="New York" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="NY" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="10001" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commission Details</CardTitle>
              <CardDescription>
                Agent's commission information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="commissionPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Percentage</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            step="0.01"
                            placeholder="60.00" 
                            {...field} 
                            value={field.value || ""}
                          />
                          <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="overridePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Override Percentage</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            step="0.01"
                            placeholder="10.00" 
                            {...field} 
                            value={field.value || ""}
                          />
                          <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Other relevant agent details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this agent..." 
                        className="h-32"
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banking Information</CardTitle>
              <CardDescription>
                Agent's banking details for commission payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Chase, Wells Fargo, etc." 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bankAccountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Checking">Checking</SelectItem>
                          <SelectItem value="Savings">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Payment Method</FormLabel>
                  <Input 
                    placeholder="Direct Deposit" 
                    value="Direct Deposit"
                    disabled
                    className="mb-1"
                  />
                  <input 
                    type="hidden" 
                    name="bankPaymentMethod"
                    value="Direct Deposit"
                  />
                  <FormDescription>
                    All payments are made via direct deposit
                  </FormDescription>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bankRoutingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="9-digit routing number" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Account number" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/agent-detail/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}