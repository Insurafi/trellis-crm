import { useQuery } from "@tanstack/react-query";
import { Review, Client } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, StarHalf } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewWithClient extends Review {
  client?: Client;
}

const ReviewStars = ({ rating }: { rating: number }) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<StarHalf key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    } else {
      stars.push(<Star key={i} className="h-4 w-4 text-yellow-400" />);
    }
  }
  
  return <div className="flex">{stars}</div>;
};

const ClientReviews = () => {
  const { data: reviews, isLoading: isLoadingReviews, error: reviewsError } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
  });
  
  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const isLoading = isLoadingReviews || isLoadingClients;
  const error = reviewsError || clientsError;

  // Combine reviews with client data
  const reviewsWithClients: ReviewWithClient[] = reviews?.map(review => {
    const client = clients?.find(c => c.id === review.clientId);
    return { ...review, client };
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Reviews</CardTitle>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center pt-1">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32 ml-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div>Error loading reviews</div>;
  }

  return (
    <Card>
      <CardHeader className="border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Reviews</CardTitle>
          <Button variant="link" className="text-primary p-0">View All</Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {reviewsWithClients.length > 0 ? (
          reviewsWithClients.map((review) => (
            <div key={review.id} className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="flex items-center mb-2">
                <ReviewStars rating={review.rating} />
                <span className="ml-2 text-xs text-neutral-600">
                  {review.createdAt 
                    ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) 
                    : "Recently"}
                </span>
              </div>
              <p className="text-sm text-neutral-800">"{review.content}"</p>
              <div className="mt-3 flex items-center">
                <img 
                  src={review.client?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.client?.name || "Anonymous")}`}
                  alt="Client avatar" 
                  className="h-6 w-6 rounded-full" 
                />
                <span className="ml-2 text-xs font-medium text-neutral-900">
                  {review.client?.name || "Anonymous"}{review.client?.company ? `, ${review.client.company}` : ""}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-neutral-500">
            No reviews yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientReviews;
