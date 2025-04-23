import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SimpleTrainingPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Training Resources</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Term Life Insurance */}
        <Card>
          <CardHeader>
            <CardTitle>Term Life Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Learn the basics of term life insurance, its benefits, and how to explain it to clients.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              Watch Training Video
            </a>
            <Button variant="outline" className="w-full">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Term with Living Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Term with Living Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Learn about term life insurance with living expenses benefits that provide coverage during your lifetime.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              Watch Training Video
            </a>
            <Button variant="outline" className="w-full">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Universal Life */}
        <Card>
          <CardHeader>
            <CardTitle>Universal Life Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Understand universal life insurance and how to present its flexible features to potential clients.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              Watch Training Video
            </a>
            <Button variant="outline" className="w-full">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Whole Life */}
        <Card>
          <CardHeader>
            <CardTitle>Whole Life Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Learn about whole life insurance, its benefits, and how to position it as a lifelong financial tool.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              Watch Training Video
            </a>
            <Button variant="outline" className="w-full">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Whole Life with Living Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Whole Life with Living Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Discover how to present whole life with living benefits as a comprehensive life insurance solution.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              Watch Training Video
            </a>
            <Button variant="outline" className="w-full">
              Take Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Final Expense */}
        <Card>
          <CardHeader>
            <CardTitle>Final Expense Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Learn how to position final expense insurance for older clients looking for end-of-life coverage.</p>
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-red-600 hover:bg-red-700 text-white rounded-md p-4 text-center font-medium"
            >
              Watch Training Video
            </a>
            <Button variant="outline" className="w-full">
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
              <ul className="space-y-2">
                <li>
                  <a 
                    href="https://www.amazon.com/Questions-That-Insurance-Agents-Themselves/dp/0972437614" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    Questions That Life Insurance Agents Need to Ask Themselves
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.amazon.com/Life-Insurance-Selling-Strategies-Professionals/dp/1934354007" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    Life Insurance Selling Strategies
                  </a>
                </li>
                <li>
                  <a 
                    href="https://lifeinsuranceacademy.com" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    Life Insurance Academy
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Call Scripts & Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/communications" 
                    className="text-blue-600 hover:underline"
                  >
                    Final Expense Quick Script
                  </a>
                </li>
                <li>
                  <a 
                    href="/communications" 
                    className="text-blue-600 hover:underline"
                  >
                    Term Life Introduction Script
                  </a>
                </li>
                <li>
                  <a 
                    href="/communications" 
                    className="text-blue-600 hover:underline"
                  >
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