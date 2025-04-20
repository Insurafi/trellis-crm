import DashboardMetrics from "@/components/ui/dashboard-metrics";
import TaskManagement from "@/components/dashboard/task-management";
import CalendarCard from "@/components/ui/calendar-card";
import AgentStatusList from "@/components/dashboard/agent-status-list";
import ClientList from "@/components/ui/client-list";
import { Button } from "@/components/ui/button";
import { Plus, Filter, UserPlus, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Agent {
  id: number;
  fullName: string;
  email: string;
  bankInfoExists?: boolean;
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  
  // Fetch agents with incomplete banking information
  const { data: agentsWithMissingBanking } = useQuery<Agent[]>({
    queryKey: ['/api/agents/missing-banking-info'],
    // If this API endpoint doesn't exist, the query will fail gracefully
    enabled: isAdmin // Only run this query for admin users
  });

  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600">Welcome back, {user?.fullName || "Admin"}! Here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button className="inline-flex items-center" asChild>
            <Link href="/users">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Team Member
            </Link>
          </Button>
          <Button variant="outline" className="inline-flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      {/* Admin Notifications - Check for agents with incomplete banking info */}
      {isAdmin && agentsWithMissingBanking && agentsWithMissingBanking.length > 0 && (
        <div className="mb-6">
          <Card className="border-orange-300 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-800 mb-1">Agent Banking Information Alert</h3>
                  <p className="text-orange-700 mb-2">
                    {agentsWithMissingBanking.length === 1 
                      ? "1 agent needs to complete their banking information for commission payments."
                      : `${agentsWithMissingBanking.length} agents need to complete their banking information for commission payments.`
                    }
                  </p>
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" asChild>
                    <Link href="/agents">
                      View Agents
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Dashboard Metrics */}
      <DashboardMetrics />
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <TaskManagement />
          
          {/* Client List Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Clients & Assigned Agents</CardTitle>
              <CardDescription>Recent clients and their assigned agents</CardDescription>
            </CardHeader>
            <CardContent>
              <ClientList />
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/clients">
                  View All Clients
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          <CalendarCard />
          <AgentStatusList />
        </div>
      </div>
      
      {/* Modern Quote Button */}
      <div className="my-6 flex justify-center">
        <a 
          href="https://rbrokers.com/quote-and-apply/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-semibold px-12 py-4 text-xl h-auto bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full border-0"
        >
          <Plus className="mr-3 h-6 w-6" />
          QUOTE AND APPLY
        </a>
      </div>
    </div>
  );
}
