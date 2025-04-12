import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  X, 
  CheckCircle, 
  Clock, 
  BarChart4,
  Filter,
  DollarSign,
  Calendar 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";

const commissionSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  policyNumber: z.string().min(1, { message: "Policy number is required" }),
  clientId: z.coerce.number({ required_error: "Client is required" }),
  brokerId: z.coerce.number({ required_error: "Broker is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  status: z.string().default("pending"),
  type: z.string().min(1, { message: "Type is required" }),
  paymentDate: z.string().optional().nullable(),
  policyStartDate: z.string().min(1, { message: "Policy start date is required" }),
  policyEndDate: z.string().optional().nullable(),
  carrier: z.string().optional(),
  policyType: z.string().min(1, { message: "Policy type is required" }),
  notes: z.string().optional(),
});

type CommissionFormValues = z.infer<typeof commissionSchema>;

export default function CommissionsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch commissions
  const { data: commissions = [], isLoading: isLoadingCommissions } = useQuery({
    queryKey: ['/api/commissions'],
    refetchOnWindowFocus: false,
  }) as { data: any[], isLoading: boolean };

  // Fetch clients for select dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
    refetchOnWindowFocus: false,
  }) as { data: any[] };

  // Fetch users/brokers for select dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        return await apiRequest("GET", '/api/users');
      } catch (error) {
        // If there's no users endpoint yet, return a default broker
        return [{ id: 1, fullName: "Alex Johnson" }];
      }
    },
    refetchOnWindowFocus: false,
  }) as { data: any[] };

  // Fetch commission stats
  const { data: stats = {
    totalCommissions: 0,
    pendingAmount: "$0.00",
    paidAmount: "$0.00",
    commissionsByType: {}
  }, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/commissions/stats'],
    refetchOnWindowFocus: false,
  }) as { data: any, isLoading: boolean };

  // Form for adding new commission
  const form = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      name: "",
      policyNumber: "",
      clientId: undefined,
      brokerId: 1, // Default to first broker
      amount: "",
      status: "pending",
      type: "initial",
      policyStartDate: format(new Date(), "yyyy-MM-dd"),
      policyType: "Term Life",
      notes: "",
    },
  });

  // Form for editing commission
  const editForm = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      name: "",
      policyNumber: "",
      clientId: undefined,
      brokerId: 1,
      amount: "",
      status: "pending",
      type: "initial",
      policyStartDate: "",
      policyType: "",
      notes: "",
    },
  });

  // Create commission mutation
  const createMutation = useMutation({
    mutationFn: (data: CommissionFormValues) => {
      return apiRequest('POST', '/api/commissions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/commissions/stats'] });
      toast({
        title: "Success",
        description: "Commission created successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating commission:", error);
      toast({
        title: "Error",
        description: "Failed to create commission. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update commission mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: CommissionFormValues }) => {
      return apiRequest('PATCH', `/api/commissions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/commissions/stats'] });
      toast({
        title: "Success",
        description: "Commission updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingCommission(null);
    },
    onError: (error) => {
      console.error("Error updating commission:", error);
      toast({
        title: "Error",
        description: "Failed to update commission. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete commission mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/commissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/commissions/stats'] });
      toast({
        title: "Success",
        description: "Commission deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting commission:", error);
      toast({
        title: "Error",
        description: "Failed to delete commission. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: CommissionFormValues) => {
    // Format dates properly before sending to server
    const formattedData = {
      ...data,
      paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : null,
      policyStartDate: new Date(data.policyStartDate).toISOString(),
      policyEndDate: data.policyEndDate ? new Date(data.policyEndDate).toISOString() : null,
    };
    createMutation.mutate(formattedData);
  };

  // Edit form submission handler
  const onEditSubmit = (data: CommissionFormValues) => {
    if (!editingCommission) return;
    
    // Format dates properly before sending to server
    const formattedData = {
      ...data,
      paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : null,
      policyStartDate: new Date(data.policyStartDate).toISOString(),
      policyEndDate: data.policyEndDate ? new Date(data.policyEndDate).toISOString() : null,
    };
    
    updateMutation.mutate({ id: editingCommission.id, data: formattedData });
  };

  const handleEdit = (commission: any) => {
    setEditingCommission(commission);
    
    // Format dates for the form
    editForm.reset({
      ...commission,
      paymentDate: commission.paymentDate ? format(new Date(commission.paymentDate), "yyyy-MM-dd") : "",
      policyStartDate: commission.policyStartDate ? format(new Date(commission.policyStartDate), "yyyy-MM-dd") : "",
      policyEndDate: commission.policyEndDate ? format(new Date(commission.policyEndDate), "yyyy-MM-dd") : "",
    });
    
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this commission?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter commissions based on status
  const filteredCommissions = commissions.filter((commission: any) => {
    if (filterStatus === 'all') return true;
    return commission.status === filterStatus;
  });

  const statusColors: Record<string, string> = {
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const formatCurrency = (amount: string) => {
    // If amount already has a $ sign, return as is
    if (amount.startsWith("$")) return amount;
    
    // Try to parse the amount and format it
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount);
  };

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients.find((c: any) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  // Get broker name by ID
  const getBrokerName = (brokerId: number) => {
    const broker = users.find((u: any) => u.id === brokerId);
    return broker ? broker.fullName : "Unknown Broker";
  };

  const renderStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status === "paid" && <CheckCircle className="mr-1 h-3 w-3" />}
        {status === "pending" && <Clock className="mr-1 h-3 w-3" />}
        {status === "cancelled" && <X className="mr-1 h-3 w-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Function to render commission stats dashboard
  const renderCommissionDashboard = () => {
    if (isLoadingStats) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-[120px] animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all policies and agents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAmount || "$0.00"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Clock className="inline h-3 w-3 mr-1" />
              Awaiting payment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidAmount || "$0.00"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <CheckCircle className="inline h-3 w-3 mr-1" />
              Already paid out
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthAmount || "$0.00"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Calendar className="inline h-3 w-3 mr-1" />
              {format(new Date(), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Function to render commission chart
  const renderCommissionChart = () => {
    if (isLoadingStats || !stats.commissionsByType) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      );
    }

    // Extract data for the chart
    const chartData = Object.entries(stats.commissionsByType || {}).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: parseFloat((value as string).replace(/[^0-9.-]+/g, '')),
    }));

    if (chartData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No commission data available to display.</p>
        </div>
      );
    }

    // Calculate total value for percentage display
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="h-[300px] w-full">
        <div className="flex items-center justify-center h-full">
          <div className="w-full max-w-md">
            <h3 className="text-base font-medium mb-4 text-center">Commission Breakdown by Type</h3>
            <div className="space-y-2">
              {chartData.map((entry, index) => {
                const percentage = ((entry.value / total) * 100).toFixed(1);
                const colors = [
                  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 
                  'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div key={entry.name} className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium inline-block">
                          {entry.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium inline-block">
                          {formatCurrency(entry.value.toString())} ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${percentage}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${color}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Commission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Commission</DialogTitle>
              <DialogDescription>
                Enter the details for the new commission record.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Term Life Policy" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="policyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="TL-001-2025" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client: any) => (
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
                    control={form.control}
                    name="brokerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Broker</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a broker" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1000.00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="initial">Initial</SelectItem>
                            <SelectItem value="renewal">Renewal</SelectItem>
                            <SelectItem value="override">Override</SelectItem>
                            <SelectItem value="bonus">Bonus</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
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
                            <SelectItem value="Group Life">Group Life</SelectItem>
                            <SelectItem value="Health">Health Insurance</SelectItem>
                            <SelectItem value="Disability">Disability Insurance</SelectItem>
                            <SelectItem value="Long-Term Care">Long-Term Care</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="policyStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="policyEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional for permanent policies
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </FormControl>
                        <FormDescription>
                          If paid, when was it paid
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1">
                  <FormField
                    control={form.control}
                    name="carrier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Carrier</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., State Farm, MetLife" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this commission"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Saving..." : "Save Commission"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {renderCommissionDashboard()}
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Commission Distribution</CardTitle>
            <CardDescription>
              Breakdown of commissions by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderCommissionChart()}
          </CardContent>
        </Card>
      </div>
      
      {/* Original cards kept for reference */}
      <div className="hidden">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.pendingAmount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.paidAmount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                // Remove $ and commas, convert to numbers and add
                const pending = parseFloat(stats.pendingAmount.replace(/[$,]/g, '')) || 0;
                const paid = parseFloat(stats.paidAmount.replace(/[$,]/g, '')) || 0;
                const total = pending + paid;
                
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(total);
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-lg shadow mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Commission Records</h2>
            <p className="text-sm text-muted-foreground">
              Manage and track all your insurance policy commissions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="status-filter" className="sr-only">
              Filter by Status
            </Label>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4">
          {isLoadingCommissions ? (
            <div className="text-center py-4">Loading commission data...</div>
          ) : filteredCommissions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
              <h3 className="mt-2 text-lg font-semibold">No commissions found</h3>
              <p className="text-sm text-muted-foreground">
                {filterStatus !== 'all' 
                  ? `No commissions with status "${filterStatus}" found.` 
                  : "Get started by adding your first commission record."}
              </p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Commission
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Details</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((commission: any) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <div className="font-medium">{commission.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {commission.policyNumber}
                        </div>
                        {commission.carrier && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {commission.carrier}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getClientName(commission.clientId)}</TableCell>
                      <TableCell>
                        <div className="font-medium capitalize">{commission.type}</div>
                        <div className="text-xs text-muted-foreground">{commission.policyType}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(commission.amount)}
                      </TableCell>
                      <TableCell>{renderStatusBadge(commission.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {commission.policyStartDate 
                            ? format(new Date(commission.policyStartDate), "MMM d, yyyy")
                            : "N/A"
                          }
                        </div>
                        {commission.paymentDate && (
                          <div className="flex items-center text-xs text-green-600 mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid: {format(new Date(commission.paymentDate), "MMM d, yyyy")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(commission)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(commission.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Commission Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Commission</DialogTitle>
            <DialogDescription>
              Update the details for this commission record.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client: any) => (
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
                  name="brokerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Broker</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a broker" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName}
                            </SelectItem>
                          ))}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="initial">Initial</SelectItem>
                          <SelectItem value="renewal">Renewal</SelectItem>
                          <SelectItem value="override">Override</SelectItem>
                          <SelectItem value="bonus">Bonus</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          <SelectItem value="Group Life">Group Life</SelectItem>
                          <SelectItem value="Health">Health Insurance</SelectItem>
                          <SelectItem value="Disability">Disability Insurance</SelectItem>
                          <SelectItem value="Long-Term Care">Long-Term Care</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="policyStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="policyEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy End Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1">
                <FormField
                  control={editForm.control}
                  name="carrier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Carrier</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}