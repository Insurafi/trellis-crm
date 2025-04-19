import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent, Client, insertCalendarEventSchema } from "@shared/schema";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
  isToday,
  addMonths,
  subMonths,
  formatISO
} from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CalendarPlus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  X
} from "lucide-react";

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading: isLoadingEvents, error: eventsError } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar/events'],
    onSuccess: (data) => {
      console.log("Calendar events loaded:", data?.length || 0);
      console.log("Task-related events:", data?.filter(e => e.type === 'task').length || 0);
      
      // Log the first few task events for debugging
      const taskEvents = data?.filter(e => e.type === 'task') || [];
      if (taskEvents.length > 0) {
        console.log("Sample task events:", taskEvents.slice(0, 3));
      } else {
        console.log("No task events found in calendar data");
      }
    }
  });

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const isLoading = isLoadingEvents || isLoadingClients;
  const error = eventsError || clientsError;

  // Extended schema for validation
  // Frontend schema that accepts string dates from the datetime-local inputs
  const formSchema = insertCalendarEventSchema
    .omit({ startTime: true, endTime: true })
    .extend({
      startTime: z.string(),
      endTime: z.string(),
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      type: "meeting",
      createdBy: 1, // Default user ID
    },
  });

  // Reset form with selected date when opening the dialog
  const openCreateEventDialog = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = format(date, "yyyy-MM-dd");
    
    form.reset({
      title: "",
      description: "",
      startTime: `${formattedDate}T09:00`,
      endTime: `${formattedDate}T10:00`,
      type: "meeting",
      createdBy: 1,
    });
    
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const createEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      try {
        // Log original form values
        console.log("Original form values:", JSON.stringify(values, null, 2));
        
        // Ensure valid dates before conversion
        if (!values.startTime || !values.endTime) {
          throw new Error("Start time and end time are required");
        }
        
        // Safely convert string times to ISO date strings
        const startDate = new Date(values.startTime);
        const endDate = new Date(values.endTime);
        
        // Validate that the dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format");
        }
        
        // Log the dates for debugging
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);
        console.log("ISO Start Date:", startDate.toISOString());
        console.log("ISO End Date:", endDate.toISOString());
        
        const transformedValues = {
          ...values,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        };

        // Log transformed values
        console.log("Transformed values being sent to server:", JSON.stringify(transformedValues, null, 2));

        return await apiRequest("POST", "/api/calendar/events", transformedValues);
      } catch (error) {
        console.error("Date conversion error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating event",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/calendar/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      setSelectedEvent(null);
    },
    onError: (error) => {
      toast({
        title: "Error deleting event",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createEventMutation.mutate(values);
  };

  // Handle month navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Get client name by id
  const getClientName = (clientId?: number) => {
    if (!clientId || !clients) return null;
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : null;
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500";
      case "call":
        return "bg-green-500";
      case "reminder":
        return "bg-red-500";
      case "task":
        return "bg-purple-500"; // Make tasks stand out with purple
      default:
        return "bg-neutral-500";
    }
  };

  // Render calendar grid for the current month
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "EEE";
    const daysOfWeek = [];
    let day = startDate;
    
    // Header row with day names
    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(
        <div key={`header-${i}`} className="text-center py-2 font-medium text-neutral-500">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    const weeks = [];
    let days = [];
    let formattedDate = '';
    
    day = startDate;
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const _isToday = isToday(day);
        
        // Get events for this day
        const dayEvents = events?.filter(event => 
          isSameDay(parseISO(event.startTime.toString()), day)
        ) || [];
        
        days.push(
          <div 
            key={day.toString()} 
            className={`min-h-[100px] p-1 border ${
              !isCurrentMonth ? 'bg-neutral-50 text-neutral-400' : ''
            } ${
              isSelected ? 'bg-blue-50' : ''
            } ${
              _isToday ? 'border-blue-500' : ''
            }`}
            onClick={() => openCreateEventDialog(cloneDay)}
          >
            <div className="text-right">
              <span className={`inline-block rounded-full w-7 h-7 text-center leading-7 ${
                _isToday ? 'bg-blue-500 text-white' : ''
              }`}>
                {format(day, 'd')}
              </span>
            </div>
            <div className="mt-1 space-y-1">
              {dayEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className={`text-xs p-1 rounded truncate text-white ${getEventTypeColor(event.type)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                  }}
                >
                  {format(parseISO(event.startTime.toString()), 'h:mm a')} - {event.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      
      weeks.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-px">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-7">{daysOfWeek}</div>
        {weeks}
      </div>
    );
  };

  if (error) {
    return (
      <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-neutral-900">Error Loading Calendar</h2>
          <p className="text-neutral-600 mt-2">Failed to load calendar data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Calendar</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage your schedule and appointments</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              // Get userId from the currently logged-in user
              fetch('/api/user')
                .then(res => res.json())
                .then(user => {
                  console.log("Current user:", user);
                  if (user?.id) {
                    // Fetch the user's calendar events
                    fetch(`/api/calendar/events?userId=${user.id}`)
                      .then(res => res.json())
                      .then(events => {
                        console.log(`Found ${events.length} calendar events for user ${user.id}`);
                        console.log(`Task events: ${events.filter(e => e.type === 'task').length}`);
                        toast({
                          title: "Calendar Debug Info",
                          description: `Found ${events.length} events (${events.filter(e => e.type === 'task').length} tasks)`
                        });
                      });
                  }
                });
            }}
          >
            Check Tasks
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedEvent ? "Event Details" : "Create New Event"}
                </DialogTitle>
                <DialogDescription>
                  {selectedEvent 
                    ? "View or manage this calendar event." 
                    : "Schedule a new event on your calendar."}
                </DialogDescription>
              </DialogHeader>
              
              {selectedEvent ? (
                // Event details view
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{selectedEvent.title}</h3>
                    {selectedEvent.description && (
                      <p className="text-neutral-600 mt-1">{selectedEvent.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center text-neutral-700">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                      {format(parseISO(selectedEvent.startTime.toString()), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-neutral-700">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {format(parseISO(selectedEvent.startTime.toString()), 'h:mm a')} - 
                      {format(parseISO(selectedEvent.endTime.toString()), ' h:mm a')}
                    </span>
                  </div>
                  
                  {selectedEvent.clientId && getClientName(selectedEvent.clientId) && (
                    <div className="flex items-center text-neutral-700">
                      <User className="mr-2 h-4 w-4" />
                      <span>Client: {getClientName(selectedEvent.clientId)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-neutral-700">
                    <div className={`mr-2 h-3 w-3 rounded-full ${getEventTypeColor(selectedEvent.type)}`} />
                    <span>
                      {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                    </span>
                  </div>
                  
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        if (selectedEvent) {
                          deleteEventMutation.mutate(selectedEvent.id);
                          setIsDialogOpen(false);
                        }
                      }}
                    >
                      Delete Event
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                // Create event form
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Meeting with client" {...field} />
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
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add details about the event..." 
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
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
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
                            <FormLabel>Event Type</FormLabel>
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
                                <SelectItem value="meeting">Meeting</SelectItem>
                                <SelectItem value="call">Call</SelectItem>
                                <SelectItem value="reminder">Reminder</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client (Optional)</FormLabel>
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
                        disabled={createEventMutation.isPending}
                      >
                        {createEventMutation.isPending ? "Saving..." : "Save Event"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Calendar</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-neutral-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
            </div>
          </div>
          <CardDescription>
            Click on any day to add an event. Click on an event to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-72 w-full" />
            </div>
          ) : (
            renderCalendarDays()
          )}
        </CardContent>
      </Card>
      
      {/* Event Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />
          <span className="text-sm text-neutral-600">Meeting</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
          <span className="text-sm text-neutral-600">Call</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
          <span className="text-sm text-neutral-600">Reminder</span>
        </div>
      </div>
    </div>
  );
}
