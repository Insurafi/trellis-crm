import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, insertTaskSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TaskCard from "../ui/task-card";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

// Define a simple User interface
interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role?: string;
}

const TaskManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Hardcode the users for task visibility selection
  const users: User[] = [
    { id: 1, username: "admin", firstName: "Inga", lastName: "Admin", fullName: "Inga Admin", role: "admin" },
    { id: 9, username: "tremaine", firstName: "Tremaine", lastName: "Taylor", fullName: "Tremaine Taylor", role: "agent" },
    { id: 13, username: "aaronbarnes743", firstName: "Aaron", lastName: "Barnes", fullName: "Aaron Barnes", role: "agent" },
    { id: 18, username: "monicapalmer388", firstName: "Monica", lastName: "Palmer", fullName: "Monica Palmer", role: "agent" }
  ];
  const isLoadingUsers = false;
  const usersError = null;

  // Extended schema for validation
  const formSchema = insertTaskSchema.extend({
    dueDate: z.string().optional(),
    dueTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    assignedTo: z.number().optional(),
    visibleTo: z.array(z.number()).optional(),
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
      assignedTo: undefined,
      visibleTo: [],
    },
  });
  
  // Reset selectedUsers when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedUsers([]);
    }
  }, [isDialogOpen]);

  const createTaskMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Convert string date to Date object if exists
      const dueDateTransformed = values.dueDate 
        ? new Date(values.dueDate).toISOString() 
        : undefined;
      
      // Include the currently logged-in user in visibleTo if not already there
      const currentUser = 1; // Admin ID
      const visibleTo = selectedUsers.includes(currentUser) 
        ? selectedUsers 
        : [currentUser, ...selectedUsers];
      
      // Create task with all provided fields
      const taskData = {
        ...values,
        dueDate: dueDateTransformed,
        assignedTo: values.assignedTo || 1, // Default to admin if not specified
        dueTime: values.dueTime || undefined,
        createdBy: currentUser, // Current logged in user (admin)
        visibleTo: visibleTo, // Include who can see the task
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTaskMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Tasks</CardTitle>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-neutral-200">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center">
              <Skeleton className="h-4 w-4 mr-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 ml-4" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="px-6 py-3 bg-neutral-50">
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return <div>Error loading tasks</div>;
  }

  const sortedTasks = tasks
    ? [...tasks].sort((a, b) => {
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
      })
    : [];

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-900">Tasks</CardTitle>
          <Button variant="link" className="text-primary p-0">View All</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-neutral-200">
        {sortedTasks.length > 0 ? (
          sortedTasks.slice(0, 4).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="p-6 text-center text-neutral-500">
            No tasks found. Create a new task to get started.
          </div>
        )}
      </CardContent>
      <CardFooter className="px-6 py-3 bg-neutral-50">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full flex items-center justify-center">
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} />
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
                          placeholder="Task description" 
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
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
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
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
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
                    control={form.control}
                    name="dueTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Admin</SelectItem>
                            <SelectItem value="9">Tremaine Taylor</SelectItem>
                            <SelectItem value="13">Aaron Barnes</SelectItem>
                            <SelectItem value="18">Monica Palmer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="visibleTo"
                  render={() => (
                    <FormItem>
                      <FormLabel>Who can see</FormLabel>
                      <div className="border p-4 rounded-md space-y-2 bg-neutral-50">
                        {isLoadingUsers ? (
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        ) : usersError ? (
                          <div className="text-red-500 text-sm">Error loading users</div>
                        ) : users && users.length > 0 ? (
                          <>
                            <div className="text-sm text-neutral-500 mb-2">
                              Select who can see this task. If no one is selected, only you will see it.
                            </div>
                            {users.map((user) => (
                              <div key={user.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`user-${user.id}`}
                                  checked={selectedUsers.includes(user.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedUsers([...selectedUsers, user.id]);
                                    } else {
                                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`user-${user.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {user.fullName || `${user.firstName} ${user.lastName}`} {user.id === 1 && '(You)'}
                                </label>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-neutral-500 text-sm">No users found</div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-2">
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
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default TaskManagement;
