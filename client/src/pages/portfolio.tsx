import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PortfolioItem, insertPortfolioItemSchema } from "@shared/schema";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  PlusCircle, 
  Image as ImageIcon, 
  ExternalLink, 
  Edit,
  Trash,
  Filter
} from "lucide-react";

export default function Portfolio() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: portfolioItems, isLoading, error } = useQuery<PortfolioItem[]>({
    queryKey: ['/api/portfolio/items'],
  });

  // Extract all unique categories
  const categories = portfolioItems 
    ? Array.from(new Set(portfolioItems.map(item => item.category).filter(Boolean)))
    : [];

  // Filter portfolio items based on search term and category
  const filteredItems = portfolioItems?.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!selectedCategory) return matchesSearch;
    return matchesSearch && item.category === selectedCategory;
  });

  // Extended schema for validation
  const formSchema = insertPortfolioItemSchema.extend({});
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      imageUrl: "",
    },
  });

  const createPortfolioItemMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/portfolio/items", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/items'] });
      toast({
        title: "Portfolio item created",
        description: "Your portfolio item has been created successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating portfolio item",
        description: error instanceof Error ? error.message : "Failed to create portfolio item",
        variant: "destructive",
      });
    },
  });

  const deletePortfolioItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/portfolio/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio/items'] });
      toast({
        title: "Portfolio item deleted",
        description: "The portfolio item has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting portfolio item",
        description: error instanceof Error ? error.message : "Failed to delete portfolio item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPortfolioItemMutation.mutate(values);
  };

  if (error) {
    return (
      <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-neutral-900">Error Loading Portfolio</h2>
          <p className="text-neutral-600 mt-2">Failed to load portfolio data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Portfolio</h1>
          <p className="mt-1 text-sm text-neutral-600">Showcase your work and case studies</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search portfolio..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Portfolio Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add Portfolio Item</DialogTitle>
                <DialogDescription>
                  Showcase your work by adding a new portfolio item.
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
                          <Input placeholder="E-commerce Website Redesign" {...field} />
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
                            placeholder="Brief description of the project..." 
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
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Web Design, Mobile App, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
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
                      disabled={createPortfolioItemMutation.isPending}
                    >
                      {createPortfolioItemMutation.isPending ? "Creating..." : "Create Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Portfolio Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={!selectedCategory ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map(category => (
            <Button 
              key={category} 
              variant={selectedCategory === category ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Portfolio Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="relative">
                  <img 
                    src={item.imageUrl || "https://images.unsplash.com/photo-1599499685914-e8f578b29299?auto=format&fit=crop&w=800&q=80"} 
                    alt={item.title} 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button size="icon" variant="secondary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive"
                        onClick={() => deletePortfolioItemMutation.mutate(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
                  )}
                  <div className="mt-4 flex justify-between items-center">
                    {item.category && (
                      <Badge variant="outline" className="bg-blue-100 text-primary border-blue-200">
                        {item.category}
                      </Badge>
                    )}
                    <Button variant="link" className="text-sm p-0 h-auto text-primary">
                      View Case Study
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <ImageIcon className="h-12 w-12 text-neutral-300 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-neutral-900">No portfolio items found</h3>
              <p className="mt-1 text-neutral-500">
                {searchTerm || selectedCategory 
                  ? "Try changing your search criteria or category filter" 
                  : "Add your first portfolio item to showcase your work"
                }
              </p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Portfolio Item
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Statistics */}
      {portfolioItems && portfolioItems.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Portfolio Statistics</CardTitle>
            <CardDescription>
              Overview of your portfolio items by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-neutral-500">Total Items</h3>
                  <span className="text-2xl font-bold text-primary">{portfolioItems.length}</span>
                </div>
                <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              
              {categories.length > 0 && categories.slice(0, 2).map(category => {
                const count = portfolioItems.filter(item => item.category === category).length;
                const percentage = Math.round((count / portfolioItems.length) * 100);
                
                return (
                  <div key={category} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-neutral-500">{category}</h3>
                      <span className="text-2xl font-bold text-neutral-900">{count}</span>
                    </div>
                    <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
