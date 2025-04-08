import { useQuery } from "@tanstack/react-query";
import { PortfolioItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PortfolioShowcase = () => {
  const { data: portfolioItems, isLoading, error } = useQuery<PortfolioItem[]>({
    queryKey: ['/api/portfolio/items'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Featured Portfolio</CardTitle>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="border border-neutral-200 rounded-lg">
                <Skeleton className="h-44 w-full rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div>Error loading portfolio items</div>;
  }

  return (
    <Card>
      <CardHeader className="border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Featured Portfolio</CardTitle>
          <Button variant="link" className="text-primary p-0">View All</Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {portfolioItems && portfolioItems.length > 0 ? (
            portfolioItems.slice(0, 2).map((item) => (
              <div key={item.id} className="rounded-lg overflow-hidden border border-neutral-200 transition-shadow hover:shadow-md">
                <img 
                  src={item.imageUrl || "https://images.unsplash.com/photo-1599499685914-e8f578b29299?auto=format&fit=crop&w=800&q=80"} 
                  alt={item.title} 
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-neutral-900">{item.title}</h3>
                  <p className="mt-1 text-xs text-neutral-600">{item.description}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <Badge variant="outline" className="bg-blue-100 text-primary border-blue-200">
                      {item.category || "Uncategorized"}
                    </Badge>
                    <Button variant="link" className="text-sm p-0 h-auto text-primary">
                      View Case Study
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-10 text-neutral-500">
              No portfolio items to display
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioShowcase;
