import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MarketingCampaign, insertMarketingCampaignSchema, Client } from "@shared/schema";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Mail, 
  PlusCircle, 
  MoreHorizontal, 
  Calendar, 
  Edit,
  Trash,
  Play,
  Pause,
  CheckCircle,
  PenSquare,
  Megaphone,
  Download
} from "lucide-react";

export default function Marketing() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading, error } = useQuery<MarketingCampaign[]>({
    queryKey: ['/api/marketing/campaigns'],
  });

  // Filter campaigns based on search term and current tab
  const filteredCampaigns = campaigns?.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (currentTab === "all") return matchesSearch;
    return matchesSearch && campaign.status === currentTab;
  });

  // Extended schema for validation
  const formSchema = insertMarketingCampaignSchema.extend({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Convert string dates to Date objects if they exist
      const startDateTransformed = values.startDate 
        ? new Date(values.startDate).toISOString() 
        : undefined;
      
      const endDateTransformed = values.endDate 
        ? new Date(values.endDate).toISOString() 
        : undefined;
      
      const campaignData = {
        ...values,
        startDate: startDateTransformed,
        endDate: endDateTransformed,
      };

      return await apiRequest("POST", "/api/marketing/campaigns", campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
      toast({
        title: "Campaign created",
        description: "Your marketing campaign has been created successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating campaign",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const updateCampaignStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/marketing/campaigns/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
      toast({
        title: "Campaign updated",
        description: "The campaign status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating campaign",
        description: error instanceof Error ? error.message : "Failed to update campaign",
        variant: "destructive",
      });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/marketing/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting campaign",
        description: error instanceof Error ? error.message : "Failed to delete campaign",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createCampaignMutation.mutate(values);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-neutral-100 text-neutral-800 border-neutral-200">
            Draft
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Paused
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  if (error) {
    return (
      <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-neutral-900">Error Loading Marketing Campaigns</h2>
          <p className="text-neutral-600 mt-2">Failed to load marketing data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Marketing</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage your marketing campaigns and email templates</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search campaigns..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create Marketing Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new marketing campaign for your clients.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Fall Insurance Promotion" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Campaign details and objectives..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
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
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
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
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createCampaignMutation.isPending}
                    >
                      {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Marketing Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isLoading ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                campaigns?.filter(c => c.status === "active").length || 0
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Draft Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neutral-700">
              {isLoading ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                campaigns?.filter(c => c.status === "draft").length || 0
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {isLoading ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                campaigns?.filter(c => c.status === "completed").length || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Campaigns</CardTitle>
          <CardDescription>
            Create and manage your marketing campaigns.
          </CardDescription>
          <Tabs defaultValue="all" className="mt-6" onValueChange={setCurrentTab}>
            <TabsList>
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns && filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-neutral-400" />
                            <div>
                              <div>{campaign.name}</div>
                              {campaign.description && (
                                <div className="text-xs text-neutral-500 mt-1 max-w-md truncate">
                                  {campaign.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>
                          {campaign.startDate 
                            ? format(new Date(campaign.startDate), 'MMM dd, yyyy') 
                            : "—"
                          }
                        </TableCell>
                        <TableCell>
                          {campaign.endDate 
                            ? format(new Date(campaign.endDate), 'MMM dd, yyyy') 
                            : "—"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Email Templates
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              
                              {campaign.status === "draft" && (
                                <DropdownMenuItem 
                                  onClick={() => updateCampaignStatusMutation.mutate({ 
                                    id: campaign.id, 
                                    status: "active" 
                                  })}
                                  className="text-green-600"
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate Campaign
                                </DropdownMenuItem>
                              )}
                              
                              {campaign.status === "active" && (
                                <DropdownMenuItem 
                                  onClick={() => updateCampaignStatusMutation.mutate({ 
                                    id: campaign.id, 
                                    status: "paused" 
                                  })}
                                  className="text-yellow-600"
                                >
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause Campaign
                                </DropdownMenuItem>
                              )}
                              
                              {campaign.status === "paused" && (
                                <DropdownMenuItem 
                                  onClick={() => updateCampaignStatusMutation.mutate({ 
                                    id: campaign.id, 
                                    status: "active" 
                                  })}
                                  className="text-green-600"
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Resume Campaign
                                </DropdownMenuItem>
                              )}
                              
                              {(campaign.status === "active" || campaign.status === "paused") && (
                                <DropdownMenuItem 
                                  onClick={() => updateCampaignStatusMutation.mutate({ 
                                    id: campaign.id, 
                                    status: "completed" 
                                  })}
                                  className="text-blue-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Campaign
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-neutral-500">
                        {searchTerm 
                          ? "No campaigns match your search criteria" 
                          : currentTab === "all" 
                            ? "No marketing campaigns found. Create a new campaign to get started." 
                            : `No ${currentTab} campaigns found.`
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Templates */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              Create and manage your email templates for marketing campaigns, or download ready-to-use templates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Welcome Email</h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Send to new clients
                      </p>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/templates/welcome-email-template.docx.txt" download="Welcome Email Template.docx">
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      <PenSquare className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Policy Renewal</h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Policy renewal reminder
                      </p>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/templates/policy-renewal-template.docx.txt" download="Policy Renewal Template.docx">
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      <PenSquare className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Monthly Newsletter</h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Monthly updates and tips
                      </p>
                    </div>
                    <Badge variant="outline">Custom</Badge>
                  </div>
                  <div className="mt-4 text-right">
                    <Button variant="outline" size="sm">
                      <PenSquare className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardContent className="p-4 flex items-center justify-center h-full">
                  <Button variant="ghost">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Templates */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Social Media Templates</CardTitle>
            <CardDescription>
              Download ready-to-use social media post templates for various insurance products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Final Expense Posts</h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        6 customizable social media posts
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">New</Badge>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/templates/final-expense-social-media.txt" download="Final Expense Social Media Templates.txt">
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Living Expenses Posts</h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Coming soon
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" disabled>
                      <Download className="mr-2 h-3 w-3" />
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Presentation Templates */}
      <div className="mt-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Presentation Templates</CardTitle>
            <CardDescription>
              Download presentation outlines and slide decks for client meetings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Living Expenses Presentation</h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Detailed presentation outline
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">New</Badge>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/templates/living-expenses-presentation-outline.txt" download="Living Expenses Presentation Outline.txt">
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Term Life Insurance Presentation</h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Coming soon
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" disabled>
                      <Download className="mr-2 h-3 w-3" />
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
