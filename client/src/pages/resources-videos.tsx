import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft,
  Video
} from "lucide-react";

export default function ResourcesVideos() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <a 
            href="/resources" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.preventDefault();
              window.location.replace('/resources');
            }}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </a>
        </div>
        <h1 className="text-3xl font-bold">Training Videos</h1>
        <p className="text-muted-foreground mt-2">
          Educational videos on insurance products, sales techniques, and client engagement strategies.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5 text-primary" />
              Product Training Videos
            </CardTitle>
            <CardDescription>
              Learn about different insurance products and how to present them to clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="relative" style={{height: "180px"}}>
                  <div className="absolute inset-0 bg-cover bg-center" 
                       style={{backgroundImage: "url('https://img.youtube.com/vi/aOd0aAGvT38/maxresdefault.jpg')"}}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        className="bg-primary/10 hover:bg-primary/20 backdrop-blur-sm border-primary text-primary"
                        onClick={() => window.open("https://www.youtube.com/watch?v=aOd0aAGvT38", "_blank")}
                      >
                        <Video className="h-6 w-6 mr-2" />
                        Watch Video
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-3">
                  <h3 className="font-medium">Indexed Universal Life Insurance</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Learn about Indexed Universal Life policies, how they work, and strategies for presenting them to clients.
                  </p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="relative" style={{height: "180px"}}>
                  <div className="absolute inset-0 bg-cover bg-center" 
                       style={{backgroundImage: "url('https://img.youtube.com/vi/PNQCfRzXmB8/maxresdefault.jpg')"}}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        className="bg-primary/10 hover:bg-primary/20 backdrop-blur-sm border-primary text-primary"
                        onClick={() => window.open("https://www.youtube.com/watch?v=PNQCfRzXmB8", "_blank")}
                      >
                        <Video className="h-6 w-6 mr-2" />
                        Watch Video
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-3">
                  <h3 className="font-medium">Simplified Issue Life Insurance</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    An overview of simplified issue insurance products and how they can benefit specific client situations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5 text-primary" />
              Sales Techniques
            </CardTitle>
            <CardDescription>
              Videos demonstrating effective selling strategies and client interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="relative" style={{height: "180px"}}>
                  <div className="absolute inset-0 bg-cover bg-center" 
                       style={{backgroundImage: "url('https://img.youtube.com/vi/jY4l6Vo3RAU/maxresdefault.jpg')"}}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        className="bg-primary/10 hover:bg-primary/20 backdrop-blur-sm border-primary text-primary"
                        onClick={() => window.open("https://www.youtube.com/watch?v=jY4l6Vo3RAU", "_blank")}
                      >
                        <Video className="h-6 w-6 mr-2" />
                        Watch Video
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-3">
                  <h3 className="font-medium">Final Expense Sales for Low Income Seniors</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Effective techniques for helping seniors with limited income secure final expense coverage.
                  </p>
                </div>
              </div>


            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}