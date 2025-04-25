import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ArticleRedirect() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get URL from query parameter
  const queryParams = new URLSearchParams(window.location.search);
  const url = queryParams.get("url");
  const title = queryParams.get("title") || "Article";
  
  useEffect(() => {
    if (!url) {
      toast({
        title: "Error",
        description: "No URL provided. Redirecting back to resources.",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/resources"), 2000);
    }
  }, [url, toast, setLocation]);

  const handleOpenArticle = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-3xl p-8 border rounded-xl bg-card shadow-sm">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/resources/books-fixed")}
            className="mb-6"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Articles & Websites
          </Button>
          
          <h1 className="text-3xl font-bold mb-4">
            {title}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            You're being redirected to an external resource. Click the button below to open it in a new tab.
          </p>
          
          <div className="flex flex-col items-center space-y-4">
            <Button 
              size="lg" 
              className="w-full md:w-auto px-8 py-6 text-lg" 
              onClick={handleOpenArticle}
              disabled={!url}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Open {title}
            </Button>
            
            {url && (
              <p className="text-sm text-muted-foreground break-all mt-4 text-center">
                URL: {url}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}