import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function DirectTrainingPage() {
  return (
    <div className="container py-8 mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Direct Training Links</h1>
      
      <Alert className="mb-6 bg-yellow-50 border-yellow-300">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Alternative Training Format</AlertTitle>
        <AlertDescription className="text-yellow-700">
          This page provides direct YouTube links to all training videos. Click any button below to open the video in a new tab.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-8">
        <div className="border p-6 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-bold mb-3">Term Life Insurance</h2>
          <p className="mb-5 text-gray-600">Learn the basics of term life insurance policies and how to present them to clients.</p>
          
          <div className="bg-muted p-6 rounded-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-muted-foreground">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <p className="font-medium mb-1">Video Coming Soon</p>
            <p className="text-sm text-muted-foreground">We're updating our training content for better learning experiences.</p>
          </div>
        </div>

        <div className="border p-6 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-bold mb-3">Term with Living Expenses</h2>
          <p className="mb-5 text-gray-600">Learn about term life insurance with living expense benefits and how they help clients.</p>
          
          <a 
            href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
          >
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"></path>
            </svg>
            Watch Term with Living Expenses Training
          </a>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Video ID: 5wa87ydMXE4 • Click to open in YouTube
          </div>
        </div>

        <div className="border p-6 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-bold mb-3">Whole Life Insurance</h2>
          <p className="mb-5 text-gray-600">Understand the features and benefits of whole life insurance policies for your clients.</p>
          
          <a 
            href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
          >
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"></path>
            </svg>
            Watch Whole Life Insurance Training
          </a>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Video ID: 5wa87ydMXE4 • Click to open in YouTube
          </div>
        </div>
        
        <div className="border p-6 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-bold mb-3">Whole Life with Living Expenses</h2>
          <p className="mb-5 text-gray-600">Learn how whole life with living expenses provides lifetime coverage plus living benefits.</p>
          
          <a 
            href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
          >
            <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"></path>
            </svg>
            Watch Whole Life with Living Expenses Training
          </a>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Video ID: 5wa87ydMXE4 • Click to open in YouTube
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <a 
          href="/training" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Return to Main Training Page
        </a>
      </div>
    </div>
  );
}