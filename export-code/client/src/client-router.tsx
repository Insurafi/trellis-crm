import { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import axios from "axios";

// Client dashboard
function ClientDashboard() {
  const [clientData, setClientData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get client data from localStorage
    const storedData = localStorage.getItem('clientData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setClientData(parsedData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error parsing stored client data:", err);
        setError("Invalid client data. Please log in again.");
        setIsLoading(false);
      }
    } else {
      setError("No client data found. Please log in again.");
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-3xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = "/client-login-new"} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {clientData?.name}</span>
            <button 
              onClick={() => {
                // Just clear localStorage and redirect
                localStorage.removeItem('clientData');
                window.location.href = "/client-login-new";
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Personal details and policies.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{clientData?.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{clientData?.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{clientData?.phone || "Not provided"}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Company</dt>
                <dd className="mt-1 text-sm text-gray-900">{clientData?.company || "Not provided"}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Policies
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              View your active insurance policies.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <p className="text-center text-gray-500 py-10">
              Loading policies... (This is a placeholder)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple client login page
function ClientLoginNew() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("client");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check if already logged in via localStorage
    const storedData = localStorage.getItem('clientData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.id) {
          // Already logged in
          navigate("/client-dashboard-new");
        }
      } catch (err) {
        // Invalid data in localStorage, stay on login page
        localStorage.removeItem('clientData');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log(`Attempting login with username: ${username}`);
      
      // Use our direct client login endpoint instead
      const response = await axios.post(
        "/direct-client-login", 
        { username, password },
        { withCredentials: true }
      );
      
      console.log("Login successful:", response.data);
      
      // Store client data in localStorage for dashboard access
      localStorage.setItem('clientData', JSON.stringify(response.data));
      
      navigate("/client-dashboard-new");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Client Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-blue-400 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Client portal main router
export default function ClientPortalRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/client-login-new" component={ClientLoginNew} />
        <Route path="/client-dashboard-new" component={ClientDashboard} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}