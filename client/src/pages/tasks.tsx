import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Task, Client, insertTaskSchema } from "@shared/schema";
import { format, isPast, isToday, addDays, isFuture } from "date-fns";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define a User interface for API data
interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  PlusCircle, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  User
} from "lucide-react";

export default function Tasks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { user, isAgent } = useAuth();
  
  // Fetch agent data if user is an agent
  const { data: agentData, isLoading: isAgentLoading } = useQuery<any>({
    queryKey: ["/api/agents/by-user"],
    enabled: !!user?.id && isAgent,
  });
  
  // Check if agent ID is valid for data fetching
  const hasValidAgentId = agentData && agentData.id !== undefined && agentData.id !== null && agentData.id > 0;
  
  // For agents, only fetch tasks assigned to them
  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useQuery<Task[]>({
    queryKey: ['/api/tasks', isAgent && hasValidAgentId ? `assignedTo=${user?.id}` : null],
    queryFn: async () => {
      const url = isAgent && hasValidAgentId && user?.id 
        ? `/api/tasks?assignedTo=${user.id}` 
        : '/api/tasks';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return response.json();
    },
  });

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  // Get users/agents to assign tasks to
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const isLoading = isLoadingTasks || isLoadingClients || isLoadingUsers || isAgentLoading;
  const error = tasksError || clientsError || usersError;

  // Filter tasks based on search term and current tab
  const filteredTasks = tasks?.filter(task => {
    // Search filter
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Tab filter
    if (currentTab === "all") return matchesSearch;
    if (currentTab === "today") {
      return matchesSearch && task.dueDate && isToday(new Date(task.dueDate));
    }
    if (currentTab === "upcoming") {
      return matchesSearch && task.dueDate && isFuture(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
    }
    if (currentTab === "overdue") {
      return matchesSearch && task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== "completed";
    }
    if (currentTab === "completed") {
      return matchesSearch && task.status === "completed";
    }
    return matchesSearch;
  });

  // Sort tasks
  const sortedTasks = filteredTasks ? [...filteredTasks].sort((a, b) => {
    // First by status (pending first)
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    
    // Then by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    // Then by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    return 0;
  }) : [];

  // Get client name by id
  const getClientName = (clientId?: number) => {
    if (!clientId || !clients) return null;
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : null;
  };
  
  // Get user name by id
  const getUserName = (userId?: number) => {
    if (!userId || !users) return null;
    const userFound = users.find(u => u.id === userId);
    if (!userFound) return null;
    
    return userFound.fullName || 
      userFound.name || 
      (userFound.firstName && userFound.lastName ? `${userFound.firstName} ${userFound.lastName}` : null) || 
      userFound.username;
  };

  // Extended schema for validation
  const formSchema = insertTaskSchema.extend({
    dueDate: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg as any);
        return arg;
      },
      z.date().optional()
    ),
    dueTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: undefined,
      dueTime: undefined,
    },
  });
  
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: undefined,
      dueTime: undefined,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Date is already properly validated and converted by our schema
      // but we need to ensure it's in the right format for the API
      
      // When agent creates a task, assign it to themselves
      const taskData = {
        ...values,
        assignedTo: user?.id || 1, // Use current user's ID if available
        // If dueDate exists, it's already a Date object thanks to our schema preprocessing
        // Make sure dueTime is properly formatted
        dueTime: values.dueTime || undefined,
      };

      return await apiRequest("POST", "/api/tasks", taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating task",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Task updated",
        description: "The task status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema> & { id: number }) => {
      const { id, ...taskData } = values;
      // When updating a task, ensure we format the date and time correctly
      return await apiRequest("PATCH", `/api/tasks/${id}`, {
        ...taskData,
        dueTime: taskData.dueTime || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingTask(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTaskMutation.mutate(values);
  };
  
  const onEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (!editingTask) return;
    updateTaskMutation.mutate({
      ...values,
      id: editingTask.id,
    });
  };
  
  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      status: task.status || "pending",
      clientId: task.clientId,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      dueTime: task.dueTime || undefined,
    });
    setIsEditDialogOpen(true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">High</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getDueDate = (dueDate: string, dueTime?: string | null) => {
    if (!dueDate) return null;
    const formattedDueTime = dueTime || undefined;
    
    const date = new Date(dueDate);
    const today = new Date();
    const timeDisplay = formattedDueTime ? ` at ${formattedDueTime}` : '';
    
    if (isToday(date)) {
      return (
        <div className="flex items-center text-yellow-600">
          <Clock className="mr-1 h-4 w-4" />
          <span>Due today{timeDisplay}</span>
        </div>
      );
    }
    
    if (isPast(date)) {
      return (
        <div className="flex items-center text-red-600">
          <AlertCircle className="mr-1 h-4 w-4" />
          <span>Overdue ({format(date, 'MMM dd')}{timeDisplay})</span>
        </div>
      );
    }
    
    // Check if it's tomorrow
    const tomorrow = addDays(today, 1);
    if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return (
        <div className="flex items-center text-blue-600">
          <Calendar className="mr-1 h-4 w-4" />
          <span>Due tomorrow{timeDisplay}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-neutral-600">
        <Calendar className="mr-1 h-4 w-4" />
        <span>Due {format(date, 'MMM dd')}{timeDisplay}</span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-neutral-900">Error Loading Tasks</h2>
          <p className="text-neutral-600 mt-2">Failed to load task data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Tasks</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage your tasks and stay organized</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to keep track of your work.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Follow up with client" {...field} />
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
                            placeholder="Provide more details about the task..." 
                            value={field.value || ''} 
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Associated Client (Optional)</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select client" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clients?.map(client => (
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
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || 'medium'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
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
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} 
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dueTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Time</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* User Assignment Field */}
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString() || user?.id?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map(u => (
                              <SelectItem key={u.id} value={u.id.toString()}>
                                {getUserName(u.id) || u.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          By default, tasks are assigned to you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                      disabled={createTaskMutation.isPending}
                    >
                      {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>
            Keep track of all your tasks and stay organized.
          </CardDescription>
          <Tabs defaultValue="all" className="mt-6" onValueChange={setCurrentTab}>
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {sortedTasks && sortedTasks.length > 0 ? (
                <div className="space-y-2">
                  {sortedTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`p-4 border rounded-md ${task.status === "completed" ? "bg-neutral-50" : "bg-white"}`}
                    >
                      <div className="flex items-start">
                        <Checkbox 
                          checked={task.status === "completed"}
                          onCheckedChange={(checked) => {
                            updateTaskStatusMutation.mutate({
                              id: task.id,
                              status: checked ? "completed" : "pending"
                            });
                          }}
                          className="mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${task.status === "completed" ? "text-neutral-500 line-through" : "text-neutral-900"}`}>
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(task);
                                }}
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="mr-1"
                                >
                                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                </svg>
                                Edit
                              </Button>
                              {getPriorityBadge(task.priority || 'medium')}
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className={`mt-1 text-sm ${task.status === "completed" ? "text-neutral-400" : "text-neutral-600"}`}>
                              {task.description}
                            </p>
                          )}
                          
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                            {task.dueDate && (
                              <div className="mr-4">
                                {getDueDate(task.dueDate?.toString() || '', task.dueTime || undefined)}
                              </div>
                            )}
                            
                            {task.clientId && getClientName(task.clientId) && (
                              <div className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                <span>Client: {getClientName(task.clientId)}</span>
                              </div>
                            )}
                            
                            {task.status === "completed" && (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                <span>Completed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  {searchTerm 
                    ? "No tasks match your search criteria" 
                    : currentTab === "all" 
                      ? "No tasks found. Create a new task to get started." 
                      : `No ${currentTab} tasks found.`
                  }
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update this task's details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Follow up with client" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide more details about the task..." 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Client (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.map(client => (
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || 'medium'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
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
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''} 
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="dueTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || 'pending'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
