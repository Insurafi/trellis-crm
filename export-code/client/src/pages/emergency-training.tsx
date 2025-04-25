import React from "react";

// The most basic page possible with no external dependencies
export default function EmergencyTrainingPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Emergency Training Page</h1>
      <p className="mb-4">This is a basic emergency training page with direct links to YouTube videos.</p>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Term Life Insurance</h2>
        <p className="mb-3">Learn the basics of term life insurance, its benefits, and how to explain it to clients.</p>
        <div className="bg-slate-100 p-4 rounded-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-slate-500">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <p className="font-medium">Video Coming Soon</p>
          <p className="text-sm text-slate-500">Training content is being updated</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Term with Living Expenses</h2>
        <p className="mb-3">Learn about term life insurance with living expenses benefits.</p>
        <a 
          href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Watch Training Video
        </a>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Universal Life Insurance</h2>
        <p className="mb-3">Understand universal life insurance and how to present its features.</p>
        <a 
          href="https://www.youtube.com/watch?v=5wa87ydMXE4" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Watch Training Video
        </a>
      </div>
    </div>
  );
}