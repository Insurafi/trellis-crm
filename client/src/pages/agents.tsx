import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Agent } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, Eye } from "lucide-react";

// Extend Agent type to include the name and fullName properties
type AgentWithName = Agent & { 
  name?: string;
  fullName?: string;
  email?: string;
  commissionPercentage?: string;
};

// Form schema - Supporting both full and simplified agent creation
const agentFormSchema = z.object({
  // Personal information - Only these are required
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  
  // Login credentials (for creating a new user account - completely optional)
  username: z.string().min(3, "Username must be at least 3 characters").optional().or(z.literal('')),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  
  // Agent professional details - Now optional for simplified creation
  licenseNumber: z.string().optional(),
  licenseExpiration: z.string().optional(),
  npn: z.string().optional(),
  phoneNumber: z.string().optional(),
  
  // Address information - Now optional for simplified creation
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  
  // Agency details - Now optional for simplified creation
  carrierAppointments: z.string().optional(),
  uplineAgentId: z.number().nullable().optional(),
  commissionPercentage: z.string().optional(),
  overridePercentage: z.string().optional(),
  specialties: z.string().optional(),
  notes: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const AgentsPage: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithName | null>(null);
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(true); // Default to simplified mode

  // Fetch agents
  const { data: agentsData, isLoading, error } = useQuery<AgentWithName[]>({
    queryKey: ["/api/agents"],
    throwOnError: true,
  });
  
  // Ensure we have a valid array of agents
  const agents = Array.isArray(agentsData) ? agentsData : [];
  
  // State for tracking which agent's commission data is being viewed
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false);
  
  // Fetch weekly commission data for selected agent
  const { data: weeklyCommissionData, isLoading: isLoadingCommission, error: commissionError } = useQuery({
    queryKey: ["/api/commissions/weekly/by-agent", selectedAgentId],
    enabled: !!selectedAgentId && isCommissionDialogOpen, // Only fetch when dialog is open
    throwOnError: false, // Don't throw errors, handle them gracefully
    retry: false,  // Don't retry failed requests
    gcTime: 0, // Don't cache failed requests
    refetchOnMount: false, // Don't refetch automatically
  });

  // Add agent mutation
  const addAgentMutation = useMutation({
    mutationFn: (newAgent: AgentFormValues) => {
      // Log the data being sent to ensure first/last name are included
      console.log("Submitting agent data:", JSON.stringify(newAgent, null, 2));
      
      // Make sure firstName and lastName are not empty
      if (!newAgent.firstName || !newAgent.lastName) {
        console.error("Missing firstName or lastName in agent data");
        toast({
          title: "Error",
          description: "First name and last name are required",
          variant: "destructive",
        });
        throw new Error("First name and last name are required");
      }
      
      return apiRequest("POST", "/api/agents", newAgent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent added",
        description: "New agent has been successfully added",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add agent: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      });
    },
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AgentFormValues }) => {
      // Log the data being sent to ensure first/last name are included
      console.log("Updating agent data:", JSON.stringify(data, null, 2));
      
      // Make sure firstName and lastName are not empty
      if (!data.firstName || !data.lastName) {
        console.error("Missing firstName or lastName in agent update data");
        toast({
          title: "Error",
          description: "First name and last name are required",
          variant: "destructive",
        });
        throw new Error("First name and last name are required");
      }
      
      return apiRequest("PUT", `/api/agents/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent updated",
        description: "Agent has been successfully updated",
      });
      setIsEditDialogOpen(false);
      setSelectedAgent(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update agent: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      });
    },
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Attempting to delete agent with ID: ${id}`);
      try {
        const response = await apiRequest("DELETE", `/api/agents/${id}`);
        console.log(`Delete response status: ${response.status}`);
        
        // For 204 No Content responses, apiRequest might return empty object
        if (response.status === 204) {
          return { success: true, status: 204 };
        }
        
        return response;
      } catch (error) {
        // If the agent was already deleted (404), consider it a success
        if (error instanceof Error && error.message.includes('404')) {
          console.log("Agent was already deleted (404), treating as success");
          return { success: true, status: 404, message: "Agent already deleted" };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent deleted",
        description: "Agent has been successfully deleted",
      });
    },
    onError: (error) => {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: `Failed to delete agent: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  // Add agent form
  const addForm = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      // Personal information
      firstName: "",
      lastName: "",
      
      // Login credentials
      username: "",
      password: "",
      email: "",
      
      // Agent details
      licenseNumber: "",
      licenseExpiration: "",
      npn: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      carrierAppointments: "",
      uplineAgentId: null,
      commissionPercentage: "70.00",
      overridePercentage: "0.00",
      specialties: "",
      notes: "",
    },
  });

  // Edit agent form
  const editForm = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
  });

  // Format date from ISO string to YYYY-MM-DD
  const formatDate = (isoDate: string | null | undefined) => {
    if (!isoDate) return ""; // Handle null or undefined dates
    
    try {
      const date = new Date(isoDate);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log("Invalid date:", isoDate);
        return "";
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Initialize the edit form when an agent is selected
  React.useEffect(() => {
    if (selectedAgent && isEditDialogOpen) {
      console.log("Edit dialog opened for agent:", selectedAgent);
      
      // We need to populate the form with agent data
      try {
        // Try to get the name from fullName or name field
        let firstName = "";
        let lastName = "";
        
        // Check for name in various properties
        if (selectedAgent.fullName) {
          const nameParts = selectedAgent.fullName.split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        } else if (selectedAgent.name) {
          const nameParts = selectedAgent.name.split(" ");
          firstName = nameParts[0] || "";
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        }
        
        // Reset the form with all values
        editForm.reset({
          firstName,
          lastName,
          licenseNumber: selectedAgent.licenseNumber || "",
          licenseExpiration: formatDate(selectedAgent.licenseExpiration),
          npn: selectedAgent.npn || "",
          phoneNumber: selectedAgent.phoneNumber || "",
          address: selectedAgent.address || "",
          city: selectedAgent.city || "",
          state: selectedAgent.state || "",
          zipCode: selectedAgent.zipCode || "",
          carrierAppointments: selectedAgent.carrierAppointments || "",
          uplineAgentId: selectedAgent.uplineAgentId || null,
          commissionPercentage: selectedAgent.commissionPercentage || "0.00",
          overridePercentage: selectedAgent.overridePercentage || "0.00",
          specialties: selectedAgent.specialties || "",
          notes: selectedAgent.notes || "",
        });
        
        console.log("Form reset completed with values from agent");
      } catch (error) {
        console.error("Error setting form values:", error);
        toast({
          title: "Error",
          description: "Failed to prepare form for editing: " + (error instanceof Error ? error.message : "Unknown error"),
          variant: "destructive",
        });
      }
    }
  }, [selectedAgent, isEditDialogOpen, editForm, toast, formatDate]);

  // Handle add form submission
  const onAddSubmit = (data: AgentFormValues) => {
    if (isSimplifiedMode) {
      // For simplified creation, just send the minimum required fields
      const simplifiedData = {
        firstName: data.firstName,
        lastName: data.lastName,
        // Include optional credentials if provided
        ...(data.username && { username: data.username }),
        ...(data.password && { password: data.password }),
        ...(data.email && { email: data.email })
      };
      
      console.log("Submitting simplified agent creation:", simplifiedData);
      addAgentMutation.mutate(simplifiedData as AgentFormValues);
    } else {
      // Full agent creation with all fields
      addAgentMutation.mutate(data);
    }
  };

  // Handle edit form submission
  const onEditSubmit = (data: AgentFormValues) => {
    if (selectedAgent) {
      updateAgentMutation.mutate({
        id: selectedAgent.id,
        data,
      });
    }
  };

  // Handle delete agent
  const handleDelete = (agent: AgentWithName) => {
    // Use fullName or licenseNumber to identify the agent in confirmation dialog
    const displayName = agent.fullName || agent.licenseNumber || `Agent #${agent.id}`;
    if (window.confirm(`Are you sure you want to delete ${displayName}? This will also remove this agent from any leads, clients, and other relationships.`)) {
      console.log(`User confirmed deletion of agent ID: ${agent.id}`);
      deleteAgentMutation.mutate(agent.id);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Insurance Agents</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              <span>Add Agent</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new insurance agent. You can create an agent with just their name or provide full details.
              </DialogDescription>
            </DialogHeader>
            
            {/* Simplified/Full toggle */}
            <div className="flex items-center border rounded p-3 mb-4 bg-slate-50">
              <div className="flex-1">
                <h3 className="font-medium">Quick Add Mode</h3>
                <p className="text-sm text-muted-foreground">Only provide name and optional login credentials, system will generate the rest</p>
              </div>
              <Switch 
                checked={isSimplifiedMode}
                onCheckedChange={setIsSimplifiedMode}
              />
            </div>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
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
                    control={addForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Login credential fields */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Login Credentials (Optional)</h3>
                  <p className="text-sm text-muted-foreground">Create login credentials for this agent to access the system. If you leave these blank, the system will generate them for you.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="agent_username" {...field} />
                        </FormControl>
                        <FormDescription>The agent will use this to log in</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="agent@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormDescription>Minimum 6 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {!isSimplifiedMode && (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Agent Details</h3>
                      <p className="text-sm text-muted-foreground">Professional and license information.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input placeholder="AG12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="npn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NPN</FormLabel>
                            <FormControl>
                              <Input placeholder="1234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="555-123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={addForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Insurance Ave" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={addForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={addForm.control}
                      name="carrierAppointments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carrier Appointments</FormLabel>
                          <FormControl>
                            <Input placeholder="Prudential, MetLife, Northwestern Mutual" {...field} />
                          </FormControl>
                          <FormDescription>Separate multiple carriers with commas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="commissionPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission Percentage</FormLabel>
                            <FormControl>
                              <Input placeholder="70.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="overridePercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Override Percentage</FormLabel>
                            <FormControl>
                              <Input placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={addForm.control}
                      name="specialties"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialties</FormLabel>
                          <FormControl>
                            <Input placeholder="Term Life, Whole Life, Universal Life" {...field} />
                          </FormControl>
                          <FormDescription>Separate multiple specialties with commas</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional information..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {isSimplifiedMode && (
                  <div className="p-4 border rounded bg-slate-50">
                    <div className="flex items-center mb-2">
                      <div className="h-4 w-4 mr-2 text-green-500">✓</div>
                      <p className="text-sm">Agent will be created with just name information</p>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="h-4 w-4 mr-2 text-green-500">✓</div>
                      <p className="text-sm">System will generate temporary license/details</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 mr-2 text-green-500">✓</div>
                      <p className="text-sm">Details can be updated later</p>
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addAgentMutation.isPending}
                  >
                    {addAgentMutation.isPending ? "Saving..." : "Save Agent"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading agents...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-red-500">Error loading agents</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Agents</CardTitle>
            <CardDescription>
              Manage your insurance agency's agents and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Name</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.length > 0 ? (
                    agents.map((agent: Agent & {name?: string}) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name || "Unnamed Agent"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {agent.specialties && agent.specialties.split(',').map((specialty, index) => (
                              <Badge key={index} variant="outline" className="whitespace-nowrap">
                                {specialty.trim()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="text-sm">{agent.commissionPercentage ? `${agent.commissionPercentage}%` : "60%"}</div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setSelectedAgentId(agent.id);
                                setIsCommissionDialogOpen(true);
                              }}
                            >
                              View Commissions
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/agent-detail/${agent.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View Agent Details"
                              >
                                <Eye size={16} />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // Simple approach with minimal code
                                setSelectedAgent(agent);
                                setIsEditDialogOpen(true);
                                console.log("Edit clicked for agent:", agent.id);
                              }}
                              title="Edit Agent"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(agent)}
                              title="Delete Agent"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No agents found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Commission Dialog */}
      <Dialog open={isCommissionDialogOpen} onOpenChange={setIsCommissionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Weekly Commissions</DialogTitle>
            <DialogDescription>
              View agent's weekly commission payments
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingCommission ? (
            <div className="py-8 flex justify-center">
              <p>Loading commission data...</p>
            </div>
          ) : weeklyCommissionData && Array.isArray(weeklyCommissionData) && weeklyCommissionData.length > 0 ? (
            <div className="space-y-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Policy Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeklyCommissionData.map((commission: any, index: number) => (
                      <TableRow key={commission.id || `commission-${index}`}>
                        <TableCell>
                          {commission.date ? 
                            new Date(commission.date).toLocaleDateString() : 
                            'Pending'}
                        </TableCell>
                        <TableCell>
                          ${typeof commission.amount === 'string' && !isNaN(parseFloat(commission.amount)) ? 
                            parseFloat(commission.amount).toFixed(2) : 
                            '0.00'}
                        </TableCell>
                        <TableCell>{commission.policyType || 'Standard'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {commission.status || 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Agent Payment (60%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${Array.isArray(weeklyCommissionData) ? 
                          weeklyCommissionData.reduce((total: number, commission: any) => 
                            total + (typeof commission.amount === 'string' && !isNaN(parseFloat(commission.amount)) ? 
                              parseFloat(commission.amount) * 0.6 : 0), 0).toFixed(2) : 
                            "0.00"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Company Profit (40%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${Array.isArray(weeklyCommissionData) ? 
                          weeklyCommissionData.reduce((total: number, commission: any) => 
                            total + (typeof commission.amount === 'string' && !isNaN(parseFloat(commission.amount)) ? 
                              parseFloat(commission.amount) * 0.4 : 0), 0).toFixed(2) : 
                            "0.00"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCommissionDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p>No commission data found for this agent.</p>
              <Button 
                variant="outline" 
                onClick={() => setIsCommissionDialogOpen(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
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
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="npn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPN</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="carrierAppointments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrier Appointments</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Separate multiple carriers with commas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="commissionPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Percentage</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="overridePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Override Percentage</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialties</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Separate multiple specialties with commas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedAgent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateAgentMutation.isPending}
                >
                  {updateAgentMutation.isPending ? "Saving..." : "Update Agent"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentsPage;