import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Info, Calendar, Bell, ExternalLink, ChevronRight, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

// Sample updates until we build a real API endpoint
const SAMPLE_UPDATES = [
  {
    id: 0,
    title: "NEW: Quick Final Expense Script Added to Call Scripts",
    message: "A new streamlined Final Expense script is now available in the Call Scripts section. This quick-reference guide will help you efficiently communicate Final Expense benefits to your clients and address common objections.",
    type: "announcement",
    date: "2025-04-23T01:45:00Z",
    link: "/communications?tab=call",
    linkText: "View Final Expense Script"
  },
  {
    id: 1,
    title: "NOTICE: Resources Navigation Issue",
    message: "We're aware that some 'View Resources' links in the Training section are not working properly. Our team is actively working on this issue and expects to have it resolved by tomorrow. Thank you for your patience.",
    type: "system",
    date: "2025-04-22T19:15:00Z"
  },
  {
    id: 2,
    title: "NEW TRAINING: Term & Whole Life with Living Expenses",
    message: "Two new comprehensive training modules have been added for Term with Living Expenses and Whole Life with Living Expenses. These modules include detailed content on key features, ideal client profiles, sales tips, objection handling, and quiz questions to test your knowledge.",
    type: "training",
    date: "2025-04-21T10:00:00Z",
    link: "/training",
    linkText: "Access Training Modules"
  },
  {
    id: 3,
    title: "Essential Insurance Books & Websites Added",
    message: "Check out our curated collection of must-read insurance books and industry websites. Featured titles include 'The Digital Life Insurance Agent' by Jeff Root, 'Questions and Answers on Life Insurance' by Tony Steuer, and 'Knock Out the Competition' by Michael Bonilla, plus reliable industry websites like LIMRA, Insurance News Net, and ThinkAdvisor.",
    type: "resources",
    date: "2025-04-21T15:45:00Z",
    link: "/resources/books",
    linkText: "View Books & Websites"
  },
  {
    id: 4,
    title: "Dashboard Enhancement: Updates Section Added",
    message: "A new Updates section has been added to all dashboards to keep you informed about the latest system changes, training materials, and marketing resources.",
    type: "system",
    date: "2025-04-21T11:30:00Z"
  },
  {
    id: 5,
    title: "New Marketing Materials for Living Expenses Products",
    message: "New marketing templates, presentation slides, and client-facing materials for both Term and Whole Life with Living Expenses products are now available in the Marketing section.",
    type: "marketing",
    date: "2025-04-20T14:45:00Z",
    link: "/marketing",
    linkText: "View Marketing Resources"
  }
];

// Map update types to icons
const updateIcons: Record<string, React.ReactNode> = {
  training: <Calendar className="h-10 w-10 p-2 rounded-full bg-blue-100 text-blue-600" />,
  system: <Info className="h-10 w-10 p-2 rounded-full bg-purple-100 text-purple-600" />,
  marketing: <Bell className="h-10 w-10 p-2 rounded-full bg-green-100 text-green-600" />,
  announcement: <Bell className="h-10 w-10 p-2 rounded-full bg-amber-100 text-amber-600" />,
  resources: <BookOpen className="h-10 w-10 p-2 rounded-full bg-cyan-100 text-cyan-600" />,
  default: <Info className="h-10 w-10 p-2 rounded-full bg-gray-100 text-gray-600" />
};

interface Update {
  id: number;
  title: string;
  message: string;
  type: string;
  date: string;
  link?: string;
  linkText?: string;
}

interface UpdateCardProps {
  update: Update;
}

const UpdateCard = ({ update }: UpdateCardProps) => {
  const icon = updateIcons[update.type] || updateIcons.default;
  const formattedDate = new Date(update.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex items-start gap-4 py-4 px-6 hover:bg-gray-50 transition-colors">
      {icon}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 mb-1">{update.title}</h4>
        <p className="text-sm text-gray-600 mb-2">{update.message}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{formattedDate}</span>
          {update.link && (
            <Button variant="ghost" size="sm" className="h-7 gap-1" asChild>
              <a href={update.link}>
                {update.linkText || "Learn More"}
                <ChevronRight className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const createUpdateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.string().default("announcement"),
  link: z.string().optional(),
  linkText: z.string().optional(),
});

const UpdatesSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  // This is a placeholder until we build a real API endpoint
  // Future enhancement: Replace with an actual API endpoint
  const { data: updates, isLoading, error } = useQuery<Update[]>({
    queryKey: ['/api/updates'],
    queryFn: async () => {
      // In a real implementation, this would fetch from the API
      // For now, just return the sample data
      return new Promise(resolve => {
        setTimeout(() => resolve(SAMPLE_UPDATES), 500);
      });
    },
  });

  const form = useForm<z.infer<typeof createUpdateSchema>>({
    resolver: zodResolver(createUpdateSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "announcement",
      link: "",
      linkText: "",
    },
  });

  // This would be the real submission handler in the future
  const onSubmit = async (data: z.infer<typeof createUpdateSchema>) => {
    try {
      // In a real implementation, this would be an API call
      // apiRequest("POST", "/api/updates", data);
      
      toast({
        title: "Update created",
        description: "Your update has been posted successfully.",
      });
      
      setIsDialogOpen(false);
      form.reset();
      
      // This would invalidate the cache to reload the updates
      // queryClient.invalidateQueries({ queryKey: ['/api/updates'] });
    } catch (error) {
      toast({
        title: "Error creating update",
        description: "There was an error creating your update.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-neutral-900">Updates</CardTitle>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-neutral-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4 flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div>Error loading updates</div>;
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-900">Updates</CardTitle>
          <Button variant="link" className="text-primary p-0">View All</Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-neutral-200">
        {updates && updates.length > 0 ? (
          updates.slice(0, 3).map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))
        ) : (
          <div className="p-6 text-center text-neutral-500">
            No updates available at this time.
          </div>
        )}
      </CardContent>
      {isAdmin && (
        <CardFooter className="px-6 py-3 bg-neutral-50">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full flex items-center justify-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Update</DialogTitle>
                <DialogDescription>
                  Share an important update with your team members.
                </DialogDescription>
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
                          <Input placeholder="Update title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Update message"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="announcement">Announcement</option>
                            <option value="training">Training</option>
                            <option value="system">System Update</option>
                            <option value="marketing">Marketing</option>
                            <option value="resources">Books & Resources</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Text (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Learn More" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Post Update
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
};

export default UpdatesSection;