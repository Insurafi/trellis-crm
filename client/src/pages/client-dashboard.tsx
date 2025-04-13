import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Check, AlertCircle, Shield } from "lucide-react";
import { BiSolidFilePdf, BiSolidSpreadsheet } from 'react-icons/bi';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useClientAuth } from "@/hooks/use-client-auth";

interface ClientInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatarUrl?: string;
}

interface Document {
  id: number;
  name: string;
  type: string;
  path: string;
  uploadedAt: Date;
}

interface Policy {
  id: number;
  policyNumber: string;
  carrier: string;
  policyType: string;
  status: string;
  faceAmount: number;
  premium: number;
  premiumFrequency: string;
  applicationDate?: Date;
  issueDate?: Date;
  expiryDate?: Date;
}

export default function ClientDashboard() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get client info using a direct fetch approach with debugging
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [isLoadingClientInfo, setIsLoadingClientInfo] = useState(true);
  
  useEffect(() => {
    async function fetchClientInfo() {
      try {
        console.log("Fetching client info...");
        const response = await fetch("/api/client/info", {
          credentials: "include" // Important for cookies
        });
        
        console.log("Client info response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Client info data:", data);
          setClient(data);
        } else {
          console.error("Failed to fetch client info:", response.statusText);
          navigate("/client-login");
        }
      } catch (err) {
        console.error("Error fetching client info:", err);
        navigate("/client-login");
      } finally {
        setIsLoadingClientInfo(false);
      }
    }
    
    fetchClientInfo();
  }, [navigate]);
  
  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!isLoadingClientInfo && !client) {
      navigate("/client-login");
    }
  }, [isLoadingClientInfo, client, navigate]);

  // Fetch client documents
  const { 
    data: documents, 
    isLoading: isLoadingDocuments, 
    isError: isDocumentsError 
  } = useQuery<Document[]>({
    queryKey: ["/api/client/documents"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!client,
    retry: false
  });

  // Fetch client policies
  const { 
    data: policies, 
    isLoading: isLoadingPolicies, 
    isError: isPoliciesError 
  } = useQuery<Policy[]>({
    queryKey: ["/api/client/policies"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!client,
    retry: false
  });

  if (isLoadingClientInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">Loading your dashboard...</span>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });
      
      console.log("Logout response status:", response.status);
      
      // Even if logout fails, redirect to login page
      navigate("/client-login");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        variant: "destructive",
        title: "Logout error",
        description: "An error occurred during logout.",
      });
      // Still redirect to login page
      navigate("/client-login");
    }
  };

  const getDocumentIcon = (docType: string) => {
    switch (docType.toLowerCase()) {
      case 'pdf':
        return <BiSolidFilePdf className="h-6 w-6" />;
      case 'xls':
      case 'xlsx':
        return <BiSolidSpreadsheet className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPolicyStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, icon: JSX.Element }> = {
      'in force': { color: 'bg-green-100 text-green-800', icon: <Check className="h-4 w-4 mr-1" /> },
      'applied': { color: 'bg-blue-100 text-blue-800', icon: <Loader2 className="h-4 w-4 mr-1 animate-spin" /> },
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="h-4 w-4 mr-1" /> },
      'lapsed': { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4 mr-1" /> },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4 mr-1" /> },
    };

    const statusKey = status.toLowerCase();
    const { color, icon } = statusMap[statusKey] || { color: 'bg-gray-100 text-gray-800', icon: <Shield className="h-4 w-4 mr-1" /> };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Insurance Client Portal</h1>
              <p className="mt-1 text-blue-100">Welcome, {client?.name || "Client"}</p>
            </div>
            <Button variant="outline" className="bg-white text-blue-700 hover:bg-blue-50" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
            <TabsTrigger value="documents" className="py-2">Documents</TabsTrigger>
            <TabsTrigger value="policies" className="py-2">Policies</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>Your personal and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1 text-base">{client?.name || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-base">{client?.email || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-base">{client?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Company</h3>
                    <p className="mt-1 text-base">{client?.company || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Policies</CardTitle>
                  <CardDescription>Summary of your insurance policies</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPolicies ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span>Loading policies...</span>
                    </div>
                  ) : isPoliciesError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Unable to load your policy information. Please try again later.
                      </AlertDescription>
                    </Alert>
                  ) : policies && policies.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{policies.length}</p>
                      <p className="text-sm text-gray-500">Active insurance policies</p>
                      <Button className="mt-2" variant="outline" onClick={() => setActiveTab("policies")}>
                        View All Policies
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-4">No active policies found.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Documents</CardTitle>
                  <CardDescription>Access your insurance documents</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDocuments ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span>Loading documents...</span>
                    </div>
                  ) : isDocumentsError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Unable to load your documents. Please try again later.
                      </AlertDescription>
                    </Alert>
                  ) : documents && documents.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{documents.length}</p>
                      <p className="text-sm text-gray-500">Documents available</p>
                      <Button className="mt-2" variant="outline" onClick={() => setActiveTab("documents")}>
                        View All Documents
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-4">No documents available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>Access all of your insurance documents</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Loading your documents...</span>
                  </div>
                ) : isDocumentsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      We encountered a problem loading your documents. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : documents && documents.length > 0 ? (
                  <div className="divide-y">
                    {documents.map((doc) => (
                      <div key={doc.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-4 flex-shrink-0">
                            {getDocumentIcon(doc.type)}
                          </div>
                          <div>
                            <h4 className="text-base font-medium">{doc.name}</h4>
                            <p className="text-sm text-gray-500">
                              Added: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any documents available at the moment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Insurance Policies</CardTitle>
                <CardDescription>Details of all your current and pending policies</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPolicies ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Loading your policies...</span>
                  </div>
                ) : isPoliciesError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      We encountered a problem loading your policies. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : policies && policies.length > 0 ? (
                  <div className="space-y-6">
                    {policies.map((policy) => (
                      <Card key={policy.id} className="overflow-hidden">
                        <div className="border-b px-6 py-4 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium">{policy.policyType}</h3>
                            <p className="text-sm text-gray-500">
                              Policy #: {policy.policyNumber}
                            </p>
                          </div>
                          <div>
                            {getPolicyStatusBadge(policy.status)}
                          </div>
                        </div>
                        <div className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Carrier</h4>
                              <p className="mt-1">{policy.carrier}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Face Amount</h4>
                              <p className="mt-1">{formatCurrency(policy.faceAmount)}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Premium</h4>
                              <p className="mt-1">{formatCurrency(policy.premium)} ({policy.premiumFrequency})</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Issue Date</h4>
                              <p className="mt-1">{policy.issueDate ? new Date(policy.issueDate).toLocaleDateString() : "Pending"}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No policies</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any insurance policies at the moment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Insurance CRM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}