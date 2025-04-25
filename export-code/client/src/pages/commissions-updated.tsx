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
    thisMonthAmount: "$0.00",
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
          {/* Dialog content goes here */}
        </Dialog>
      </div>

      {/* Render dashboard */}
      {renderCommissionDashboard()}
      
      {/* Render chart */}
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

      {/* Commission filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="status-filter">Filter by Status:</Label>
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger id="status-filter" className="w-[180px]">
              <SelectValue placeholder="Select status" />
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

      {/* Commissions table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Records</CardTitle>
          <CardDescription>
            Manage your commission records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCommissions ? (
            <div className="text-center py-4">Loading commissions...</div>
          ) : filteredCommissions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No commissions found. Add your first commission to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((commission: any) => (
                  <TableRow key={commission.id}>
                    <TableCell>
                      <div className="font-medium">{commission.name}</div>
                      <div className="text-sm text-muted-foreground">{commission.policyNumber}</div>
                    </TableCell>
                    <TableCell>{getClientName(commission.clientId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{commission.type}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(commission.amount)}</TableCell>
                    <TableCell>{renderStatusBadge(commission.status)}</TableCell>
                    <TableCell>{commission.policyStartDate ? format(new Date(commission.policyStartDate), "MMM d, yyyy") : "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(commission)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(commission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
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
              {/* Form fields go here - same as add dialog */}
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Commission"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}