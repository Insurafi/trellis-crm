import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Calendar,
  User,
  Briefcase,
  LifeBuoy,
  Clock,
  Shield,
  Download,
  FileQuestion,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useClientAuth } from "@/hooks/use-client-auth";

export default function ClientDashboard() {
  const { client, isLoading: isAuthLoading } = useClientAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !client) {
      window.location.href = "/client-login-new";
    }
  }, [client, isAuthLoading]);

  // Fetch client's policies
  const { data: clientPolicies = [], isLoading: isPoliciesLoading } = useQuery<any[]>({
    queryKey: ["/api/client/policies"],
    enabled: !!client?.id,
  });

  // Fetch client's documents
  const { data: clientDocuments = [], isLoading: isDocumentsLoading } = useQuery<any[]>({
    queryKey: ["/api/client/documents"],
    enabled: !!client?.id,
  });

  // Fetch client's quotes
  const { data: clientQuotes = [], isLoading: isQuotesLoading } = useQuery<any[]>({
    queryKey: ["/api/client/quotes"],
    enabled: !!client?.id,
  });

  // Update loading state when data is fetched
  useEffect(() => {
    if (!isAuthLoading && !isPoliciesLoading && !isDocumentsLoading && !isQuotesLoading) {
      setIsLoading(false);
    }
  }, [isAuthLoading, isPoliciesLoading, isDocumentsLoading, isQuotesLoading]);

  // For upcoming events/renewals - we'll simulate this with dummy data for now
  const upcomingRenewals = [
    {
      policyName: "Term Life Insurance - MetLife",
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      premium: "$125.00/month"
    },
    {
      policyName: "Health Insurance - United Health",
      renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      premium: "$350.00/month"
    }
  ];

  // Payment status - this would be fetched from the real API
  const paymentStatus = {
    lastPayment: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    nextPayment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    currentBalance: "$0.00",
    paymentAmount: "$475.00"
  };

  // Show loading state if data is still loading
  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your client dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gradient-to-b from-blue-50 to-white">
      {/* Client profile banner */}
      <div className="bg-primary p-6 rounded-lg shadow-md text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Client Portal
            </h2>
            <p className="mt-2 text-white/90">
              Welcome back, {client?.name || "Client"}! Here's your insurance dashboard.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" asChild>
              <Link href="/contact-agent">
                <LifeBuoy className="mr-2 h-4 w-4" />
                Contact Agent
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">My Policies</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Policies
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clientPolicies.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  All policies in good standing
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Documents
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clientDocuments.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Insurance documents available
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Quotes
                </CardTitle>
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clientQuotes.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Quotes awaiting your review
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Next Payment
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentStatus.nextPayment.toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Amount: {paymentStatus.paymentAmount}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Your account and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{client?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{client?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p>{client?.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Company</p>
                      <p>{client?.company || "Not applicable"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p>{client?.address || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/edit-profile">
                        Update Information
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Renewals</CardTitle>
                <CardDescription>
                  Your policy renewals in the next 90 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingRenewals.map((renewal, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="rounded-full p-1 bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{renewal.policyName}</p>
                        <p className="text-sm text-muted-foreground">
                          Renewal: {renewal.renewalDate.toLocaleDateString()} • {renewal.premium}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {upcomingRenewals.length === 0 && (
                    <p className="text-muted-foreground">No upcoming renewals in the next 90 days.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Insurance Policies</CardTitle>
              <CardDescription>
                View all your active insurance policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientPolicies.length > 0 ? (
                <div className="space-y-6">
                  {clientPolicies.map((policy, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{policy.type} - {policy.carrier}</h3>
                          <p className="text-sm text-muted-foreground">Policy #: {policy.policyNumber}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Face Amount</p>
                          <p>{policy.faceAmount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Premium</p>
                          <p>{policy.premium}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                          <p>{new Date(policy.issueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/60" />
                  <h3 className="mt-4 text-lg font-medium">No policies found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You don't have any active insurance policies yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>
                Access all your insurance-related documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientDocuments.length > 0 ? (
                <div className="space-y-4">
                  {clientDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Added: {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground/60" />
                  <h3 className="mt-4 text-lg font-medium">No documents found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You don't have any documents to view yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Quotes</CardTitle>
              <CardDescription>
                View and respond to insurance quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientQuotes.length > 0 ? (
                <div className="space-y-6">
                  {clientQuotes.map((quote, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{quote.type} - {quote.carrier}</h3>
                          <p className="text-sm text-muted-foreground">Quote #: {quote.quoteNumber}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="default" size="sm">Accept</Button>
                          <Button variant="outline" size="sm">Decline</Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Coverage</p>
                          <p>{quote.coverage}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Premium</p>
                          <p>{quote.premium}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Expiration</p>
                          <p>{new Date(quote.expirationDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileQuestion className="mx-auto h-10 w-10 text-muted-foreground/60" />
                  <h3 className="mt-4 text-lg font-medium">No quotes available</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You don't have any pending insurance quotes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}