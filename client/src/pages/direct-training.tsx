import React from "react";

export default function DirectTrainingPage() {
  return (
    <div className="container py-8 mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Direct Training Links</h1>
      <p className="mb-6">Click the links below to access training videos directly on YouTube:</p>
      
      <div className="space-y-6">
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Term Life Insurance</h2>
          <p className="mb-4">Learn the basics of term life insurance policies and how to present them to clients.</p>
          <p className="mb-2">
            <strong>Video:</strong>{" "}
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Term Life Insurance Training (YouTube)
            </a>
          </p>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Term with Living Expenses</h2>
          <p className="mb-4">Learn about term life insurance with living expense benefits and how they help clients.</p>
          <p className="mb-2">
            <strong>Video:</strong>{" "}
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Term with Living Expenses Training (YouTube)
            </a>
          </p>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Whole Life Insurance</h2>
          <p className="mb-4">Understand the features and benefits of whole life insurance policies for your clients.</p>
          <p className="mb-2">
            <strong>Video:</strong>{" "}
            <a 
              href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Whole Life Insurance Training (YouTube)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}