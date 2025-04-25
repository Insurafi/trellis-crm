import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Review, Client, insertReviewSchema } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  PlusCircle, 
  Star, 
  MessageSquare, 
  MoreHorizontal, 
  Copy,
  Trash,
  Share,
  Edit
} from "lucide-react";

interface ReviewWithClient extends Review {
  client?: Client;
}

export default function Reviews() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading: isLoadingReviews, error: reviewsError } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
  });

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const isLoading = isLoadingReviews || isLoadingClients;
  const error = reviewsError || clientsError;

  // Combine reviews with client data
  const reviewsWithClients: ReviewWithClient[] = !isLoading && reviews && clients 
    ? reviews.map(review => ({
        ...review,
        client: clients.find(c => c.id === review.clientId)
      }))
    : [];

  // Filter reviews based on search term and rating
  const filteredReviews = reviewsWithClients?.filter(review => {
    const matchesSearch = 
      review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.client?.name && review.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (ratingFilter === null) return matchesSearch;
    return matchesSearch && review.rating === ratingFilter;
  }) || [];

  // Group reviews by rating for statistics
  const reviewsByRating = !isLoading && reviews
    ? [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length,
        percentage: reviews.length > 0 
          ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100)
          : 0
      }))
    : [];

  // Calculate average rating
  const averageRating = !isLoading && reviews && reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Extended schema for validation
  const formSchema = insertReviewSchema.extend({});
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      rating: 5,
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/reviews", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({
        title: "Review created",
        description: "The review has been created successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating review",
        description: error instanceof Error ? error.message : "Failed to create review",
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({
        title: "Review deleted",
        description: "The review has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting review",
        description: error instanceof Error ? error.message : "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createReviewMutation.mutate(values);
  };

  // Rating display component
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-neutral-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Get name initials for avatar
  const getNameInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (error) {
    return (
      <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-neutral-900">Error Loading Reviews</h2>
          <p className="text-neutral-600 mt-2">Failed to load review data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Client Reviews</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage client testimonials and feedback</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search reviews..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add Client Review</DialogTitle>
                <DialogDescription>
                  Record a new client testimonial or review.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
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
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString() || "5"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">
                              <div className="flex items-center">
                                <StarRating rating={5} />
                                <span className="ml-2">5 Stars</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="4">
                              <div className="flex items-center">
                                <StarRating rating={4} />
                                <span className="ml-2">4 Stars</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="3">
                              <div className="flex items-center">
                                <StarRating rating={3} />
                                <span className="ml-2">3 Stars</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="2">
                              <div className="flex items-center">
                                <StarRating rating={2} />
                                <span className="ml-2">2 Stars</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="1">
                              <div className="flex items-center">
                                <StarRating rating={1} />
                                <span className="ml-2">1 Star</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter the client's review text here..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
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
                      disabled={createReviewMutation.isPending}
                    >
                      {createReviewMutation.isPending ? "Saving..." : "Save Review"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reviews Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {isLoading ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                reviews?.length || 0
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-neutral-900 mr-2">
                {isLoading ? (
                  <Skeleton className="h-9 w-12" />
                ) : (
                  averageRating
                )}
              </div>
              {!isLoading && (
                <StarRating rating={Math.round(parseFloat(averageRating))} />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">5-Star Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {isLoading ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                reviews?.filter(r => r.rating === 5).length || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Rating Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-full flex-1" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsByRating.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center w-20">
                      <span className="text-sm font-medium text-neutral-600">{rating} stars</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full flex-1">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                    <div className="text-sm text-neutral-600 w-10 text-right">
                      {percentage}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Filter Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={ratingFilter === null ? "default" : "outline"} 
                size="sm"
                onClick={() => setRatingFilter(null)}
              >
                All Ratings
              </Button>
              {[5, 4, 3, 2, 1].map(rating => (
                <Button 
                  key={rating} 
                  variant={ratingFilter === rating ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setRatingFilter(rating)}
                  className="flex items-center"
                >
                  <StarRating rating={rating} />
                  <span className="ml-2">({reviewsByRating.find(r => r.rating === rating)?.count || 0})</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Client Reviews</CardTitle>
          <CardDescription>
            Manage and moderate client testimonials and feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="mt-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="p-4 bg-neutral-50 border border-neutral-200 rounded-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage 
                            src={review.client?.avatarUrl} 
                            alt={review.client?.name || "Client"} 
                          />
                          <AvatarFallback>
                            {review.client?.name 
                              ? getNameInitials(review.client.name) 
                              : "CL"
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-neutral-900">
                            {review.client?.name || "Unknown Client"}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {review.client?.company || "No company"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-neutral-500">
                          {review.createdAt 
                            ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) 
                            : "Recently"
                          }
                        </span>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-neutral-700">{review.content}</p>
                    
                    <div className="mt-4 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy to Clipboard
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="mr-2 h-4 w-4" />
                            Share Review
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Review
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteReviewMutation.mutate(review.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-neutral-900">No reviews found</h3>
                  <p className="mt-1 text-neutral-500">
                    {searchTerm || ratingFilter !== null 
                      ? "Try changing your search criteria or rating filter" 
                      : "Add your first client review to get started"
                    }
                  </p>
                  <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Review
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
        {filteredReviews.length > 5 && (
          <CardFooter className="border-t border-neutral-200">
            <div className="w-full flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
