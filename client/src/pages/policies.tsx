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
import { Policy } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, FileText, AlertCircle } from "lucide-react";

// Form schema
const policyFormSchema = z.object({
  policyNumber: z.string().min(1, "Policy number is required"),
  carrier: z.string().min(1, "Insurance carrier is required"),
  policyType: z.string().min(1, "Policy type is required"),
  faceAmount: z.string().min(1, "Face amount is required"),
  premiumAmount: z.string().min(1, "Premium amount is required"),
  premiumFrequency: z.string().min(1, "Premium frequency is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  clientId: z.number().nullable().optional(),
  leadId: z.number().nullable().optional(),
  agentId: z.number().nullable().optional(),
  beneficiaries: z.string().optional(),
  riders: z.string().optional(),
  notes: z.string().optional(),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

const PoliciesPage: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // Fetch policies
  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["/api/policies"],
  });

  // Fetch clients for dropdown
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Fetch leads for dropdown
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
  });

  // Fetch agents for dropdown
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/agents"],
  });

  // Add policy mutation
  const addPolicyMutation = useMutation({
    mutationFn: (newPolicy: PolicyFormValues) =>
      apiRequest("/api/policies", {
        method: "POST",
        data: newPolicy,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({
        title: "Policy added",
        description: "New policy has been successfully added",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add policy",
        variant: "destructive",
      });
    },
  });

  // Update policy mutation
  const updatePolicyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PolicyFormValues }) =>
      apiRequest(`/api/policies/${id}`, {
        method: "PUT",
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({
        title: "Policy updated",
        description: "Policy has been successfully updated",
      });
      setIsEditDialogOpen(false);
      setSelectedPolicy(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update policy",
        variant: "destructive",
      });
    },
  });

  // Delete policy mutation
  const deletePolicyMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/policies/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      toast({
        title: "Policy deleted",
        description: "Policy has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete policy",
        variant: "destructive",
      });
    },
  });

  // Add policy form
  const addForm = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      policyNumber: "",
      carrier: "",
      policyType: "",
      faceAmount: "",
      premiumAmount: "",
      premiumFrequency: "monthly",
      issueDate: "",
      expiryDate: "",
      status: "active",
      clientId: null,
      leadId: null,
      agentId: null,
      beneficiaries: "",
      riders: "",
      notes: "",
    },
  });

  // Edit policy form
  const editForm = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
  });

  // Format date from ISO string to YYYY-MM-DD
  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0];
  };

  // Set up edit form when a policy is selected
  React.useEffect(() => {
    if (selectedPolicy) {
      editForm.reset({
        policyNumber: selectedPolicy.policyNumber,
        carrier: selectedPolicy.carrier,
        policyType: selectedPolicy.policyType,
        faceAmount: selectedPolicy.faceAmount,
        premiumAmount: selectedPolicy.premiumAmount,
        premiumFrequency: selectedPolicy.premiumFrequency,
        issueDate: formatDate(selectedPolicy.issueDate),
        expiryDate: formatDate(selectedPolicy.expiryDate),
        status: selectedPolicy.status,
        clientId: selectedPolicy.clientId,
        leadId: selectedPolicy.leadId,
        agentId: selectedPolicy.agentId,
        beneficiaries: selectedPolicy.beneficiaries || "",
        riders: selectedPolicy.riders || "",
        notes: selectedPolicy.notes || "",
      });
      setIsEditDialogOpen(true);
    }
  }, [selectedPolicy, editForm]);

  // Handle add form submission
  const onAddSubmit = (data: PolicyFormValues) => {
    addPolicyMutation.mutate(data);
  };

  // Handle edit form submission
  const onEditSubmit = (data: PolicyFormValues) => {
    if (selectedPolicy) {
      updatePolicyMutation.mutate({
        id: selectedPolicy.id,
        data,
      });
    }
  };

  // Handle delete policy
  const handleDelete = (policy: Policy) => {
    if (window.confirm(`Are you sure you want to delete policy ${policy.policyNumber}?`)) {
      deletePolicyMutation.mutate(policy.id);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      active: { variant: "default", label: "Active" },
      pending: { variant: "secondary", label: "Pending" },
      lapsed: { variant: "destructive", label: "Lapsed" },
      cancelled: { variant: "outline", label: "Cancelled" },
      expired: { variant: "outline", label: "Expired" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const isLoading = policiesLoading || clientsLoading || leadsLoading || agentsLoading;

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Insurance Policies</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              <span>Add Policy</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Policy</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new insurance policy.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="policyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Number</FormLabel>
                        <FormControl>
                          <Input placeholder="POL-12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="carrier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Carrier</FormLabel>
                        <FormControl>
                          <Input placeholder="Prudential" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="policyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select policy type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Term Life">Term Life</SelectItem>
                            <SelectItem value="Whole Life">Whole Life</SelectItem>
                            <SelectItem value="Universal Life">Universal Life</SelectItem>
                            <SelectItem value="Variable Life">Variable Life</SelectItem>
                            <SelectItem value="Index Universal Life">Index Universal Life</SelectItem>
                            <SelectItem value="Final Expense">Final Expense</SelectItem>
                            <SelectItem value="Disability Income">Disability Income</SelectItem>
                            <SelectItem value="Long-Term Care">Long-Term Care</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="lapsed">Lapsed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="faceAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Face Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="500000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="premiumAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Premium Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="125.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addForm.control}
                    name="premiumFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Premium Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>Required for term policies</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addForm.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No client selected</SelectItem>
                            {clients?.map((client: any) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="leadId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lead" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No lead selected</SelectItem>
                            {leads?.map((lead: any) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.firstName} {lead.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="agentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select agent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No agent selected</SelectItem>
                            {agents?.map((agent: any) => (
                              <SelectItem key={agent.id} value={agent.id.toString()}>
                                {agent.fullName || agent.name || `${agent.firstName || ''} ${agent.lastName || ''}`}
                                {agent.licenseNumber ? ` (${agent.licenseNumber})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addForm.control}
                  name="beneficiaries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beneficiaries</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe (primary), John Doe (contingent)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="riders"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Riders</FormLabel>
                      <FormControl>
                        <Input placeholder="Waiver of Premium, Accelerated Death Benefit" {...field} />
                      </FormControl>
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
                        <Textarea placeholder="Additional policy details..." {...field} />
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
                    disabled={addPolicyMutation.isPending}
                  >
                    {addPolicyMutation.isPending ? "Saving..." : "Save Policy"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading policies...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Policies</CardTitle>
            <CardDescription>
              Manage your insurance policies and associated details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Face Value</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies && policies.length > 0 ? (
                    policies.map((policy: Policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">
                          {policy.policyNumber}
                        </TableCell>
                        <TableCell>{policy.carrier}</TableCell>
                        <TableCell>{policy.policyType}</TableCell>
                        <TableCell>{formatCurrency(policy.faceAmount)}</TableCell>
                        <TableCell>
                          {formatCurrency(policy.premiumAmount)} 
                          <span className="text-xs text-muted-foreground">/{policy.premiumFrequency}</span>
                        </TableCell>
                        <TableCell>
                          {new Date(policy.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={policy.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedPolicy(policy)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(policy)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No policies found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Policy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Policy</DialogTitle>
            <DialogDescription>
              Update policy information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Similar form fields as add dialog */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="policyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="carrier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Carrier</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* The rest of the form fields mirroring add form */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="policyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select policy type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Term Life">Term Life</SelectItem>
                          <SelectItem value="Whole Life">Whole Life</SelectItem>
                          <SelectItem value="Universal Life">Universal Life</SelectItem>
                          <SelectItem value="Variable Life">Variable Life</SelectItem>
                          <SelectItem value="Index Universal Life">Index Universal Life</SelectItem>
                          <SelectItem value="Final Expense">Final Expense</SelectItem>
                          <SelectItem value="Disability Income">Disability Income</SelectItem>
                          <SelectItem value="Long-Term Care">Long-Term Care</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="lapsed">Lapsed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="faceAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Face Amount</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="premiumAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premium Amount</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="premiumFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premium Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Required for term policies</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No client selected</SelectItem>
                          {clients?.map((client: any) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="leadId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lead" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No lead selected</SelectItem>
                          {leads?.map((lead: any) => (
                            <SelectItem key={lead.id} value={lead.id.toString()}>
                              {lead.firstName} {lead.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="agentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select agent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No agent selected</SelectItem>
                          {agents?.map((agent: any) => (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              {agent.fullName || agent.name || `${agent.firstName || ''} ${agent.lastName || ''}`}
                              {agent.licenseNumber ? ` (${agent.licenseNumber})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="beneficiaries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiaries</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="riders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Riders</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                    setSelectedPolicy(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatePolicyMutation.isPending}
                >
                  {updatePolicyMutation.isPending ? "Saving..." : "Update Policy"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PoliciesPage;