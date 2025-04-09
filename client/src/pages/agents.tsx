import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { Pencil, Trash2, UserPlus } from "lucide-react";

// Form schema
const agentFormSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiration: z.string().min(1, "License expiration date is required"),
  npn: z.string().min(1, "NPN is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  carrierAppointments: z.string(),
  uplineAgentId: z.number().nullable().optional(),
  commissionPercentage: z.string(),
  overridePercentage: z.string(),
  specialties: z.string(),
  notes: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const AgentsPage: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Fetch agents
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["/api/agents"],
    throwOnError: true,
  });

  // Add agent mutation
  const addAgentMutation = useMutation({
    mutationFn: (newAgent: AgentFormValues) =>
      apiRequest("/api/agents", {
        method: "POST",
        data: newAgent,
      }),
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
        description: "Failed to add agent",
        variant: "destructive",
      });
    },
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AgentFormValues }) =>
      apiRequest(`/api/agents/${id}`, {
        method: "PUT",
        data,
      }),
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
        description: "Failed to update agent",
        variant: "destructive",
      });
    },
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/agents/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent deleted",
        description: "Agent has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      });
    },
  });

  // Add agent form
  const addForm = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      licenseNumber: "",
      licenseExpiration: "",
      npn: "",
      phoneNumber: "",
      address: "",
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
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0];
  };

  // Set up edit form when an agent is selected
  React.useEffect(() => {
    if (selectedAgent) {
      editForm.reset({
        licenseNumber: selectedAgent.licenseNumber,
        licenseExpiration: formatDate(selectedAgent.licenseExpiration),
        npn: selectedAgent.npn,
        phoneNumber: selectedAgent.phoneNumber,
        address: selectedAgent.address,
        carrierAppointments: selectedAgent.carrierAppointments,
        uplineAgentId: selectedAgent.uplineAgentId,
        commissionPercentage: selectedAgent.commissionPercentage,
        overridePercentage: selectedAgent.overridePercentage,
        specialties: selectedAgent.specialties,
        notes: selectedAgent.notes || "",
      });
      setIsEditDialogOpen(true);
    }
  }, [selectedAgent, editForm]);

  // Handle add form submission
  const onAddSubmit = (data: AgentFormValues) => {
    addAgentMutation.mutate(data);
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
  const handleDelete = (agent: Agent) => {
    if (window.confirm(`Are you sure you want to delete ${agent.licenseNumber}?`)) {
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new insurance agent.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
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
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Insurance Ave, City, State ZIP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                    <TableHead>License #</TableHead>
                    <TableHead>NPN</TableHead>
                    <TableHead>License Expiration</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Commission %</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents && agents.length > 0 ? (
                    agents.map((agent: Agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.licenseNumber}</TableCell>
                        <TableCell>{agent.npn}</TableCell>
                        <TableCell>
                          {new Date(agent.licenseExpiration).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{agent.phoneNumber}</TableCell>
                        <TableCell>{agent.commissionPercentage}%</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {agent.specialties.split(',').map((specialty, index) => (
                              <Badge key={index} variant="outline" className="whitespace-nowrap">
                                {specialty.trim()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedAgent(agent)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(agent)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
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

      {/* Edit Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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