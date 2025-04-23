import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function SimpleTrainingPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-4">Insurance Training Center</h1>
      
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700">Direct YouTube Links</AlertTitle>
        <AlertDescription className="text-blue-600">
          All training videos will open in YouTube in a new browser tab for maximum compatibility.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Term Life Insurance */}
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
          <CardHeader className="bg-slate-50">
            <CardTitle>Term Life Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p>Learn the basics of term life insurance, its benefits, and how to explain it to clients.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"></path>
              </svg>
              Watch on YouTube
            </a>
            <div className="text-xs text-center text-gray-500">
              Video ID: 5wa87ydMXE4 • Opens in a new tab
            </div>
            <Button variant="outline" className="w-full mt-2">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Term with Living Expenses */}
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
          <CardHeader className="bg-slate-50">
            <CardTitle>Term with Living Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p>Learn about term life insurance with living expenses benefits that provide coverage during your lifetime.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"></path>
              </svg>
              Watch on YouTube
            </a>
            <div className="text-xs text-center text-gray-500">
              Video ID: 5wa87ydMXE4 • Opens in a new tab
            </div>
            <Button variant="outline" className="w-full mt-2">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Universal Life */}
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
          <CardHeader className="bg-slate-50">
            <CardTitle>Universal Life Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p>Understand universal life insurance and how to present its flexible features to potential clients.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"></path>
              </svg>
              Watch on YouTube
            </a>
            <div className="text-xs text-center text-gray-500">
              Video ID: 5wa87ydMXE4 • Opens in a new tab
            </div>
            <Button variant="outline" className="w-full mt-2">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Whole Life */}
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
          <CardHeader className="bg-slate-50">
            <CardTitle>Whole Life Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p>Learn about whole life insurance, its benefits, and how to position it as a lifelong financial tool.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"></path>
              </svg>
              Watch on YouTube
            </a>
            <div className="text-xs text-center text-gray-500">
              Video ID: 5wa87ydMXE4 • Opens in a new tab
            </div>
            <Button variant="outline" className="w-full mt-2">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Whole Life with Living Expenses */}
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
          <CardHeader className="bg-slate-50">
            <CardTitle>Whole Life with Living Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p>Discover how to present whole life with living benefits as a comprehensive life insurance solution.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"></path>
              </svg>
              Watch on YouTube
            </a>
            <div className="text-xs text-center text-gray-500">
              Video ID: 5wa87ydMXE4 • Opens in a new tab
            </div>
            <Button variant="outline" className="w-full mt-2">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Final Expense */}
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
          <CardHeader className="bg-slate-50">
            <CardTitle>Final Expense Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p>Learn how to position final expense insurance for older clients looking for end-of-life coverage.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45,.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"></path>
              </svg>
              Watch on YouTube
            </a>
            <div className="text-xs text-center text-gray-500">
              Video ID: 5wa87ydMXE4 • Opens in a new tab
            </div>
            <Button variant="outline" className="w-full mt-2">
              Take Quiz
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Resources Hub</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Books & Websites</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li>
                  <div 
                    onClick={() => window.open("https://www.amazon.com/dp/0972437614/", "_blank")}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Questions That Life Insurance Agents Need to Ask Themselves
                  </div>
                </li>
                <li>
                  <div 
                    onClick={() => window.open("https://www.amazon.com/dp/1934354007/", "_blank")}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Life Insurance Selling Strategies
                  </div>
                </li>
                <li>
                  <div 
                    onClick={() => window.open("https://lifeinsuranceacademy.com", "_blank")}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Life Insurance Academy
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Call Scripts & Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="/communications" 
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Final Expense Quick Script
                  </a>
                </li>
                <li>
                  <a 
                    href="/communications" 
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Term Life Introduction Script
                  </a>
                </li>
                <li>
                  <a 
                    href="/communications" 
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Whole Life Value Proposition
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}