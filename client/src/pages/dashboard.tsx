import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "wouter";
import {
  ClipboardList,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  CircleDollarSign,
  User,
  Briefcase,
  CheckCircle2,
  Clock,
  UserPlus,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardMetrics from "@/components/ui/dashboard-metrics";
import AgentStatusList from "@/components/dashboard/agent-status-list";
import TaskManagement from "@/components/dashboard/task-management";
import CalendarCard from "@/components/ui/calendar-card";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch company-wide stats
  const { data: dashboardStats, isLoading: isStatsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user?.id,
  });

  // Fetch all agents
  const { data: agents = [], isLoading: isAgentsLoading } = useQuery<any[]>({
    queryKey: ["/api/agents"],
    enabled: !!user?.id,
  });
  
  // Fetch all commissions
  const { data: commissions = [], isLoading: isCommissionsLoading } = useQuery<any[]>({
    queryKey: ["/api/commissions"],
    enabled: !!user?.id,
  });
  
  // Fetch all policies
  const { data: policies = [], isLoading: isPoliciesLoading } = useQuery<any[]>({
    queryKey: ["/api/policies"],
    enabled: !!user?.id,
  });

  // Fetch calendar events
  const { data: calendarEvents = [], isLoading: isEventsLoading } = useQuery<any[]>({
    queryKey: ["/api/calendar/events"],
    enabled: !!user?.id,
  });

  // Update loading state when data is fetched
  useEffect(() => {
    if (!isStatsLoading && !isAgentsLoading && !isCommissionsLoading && !isPoliciesLoading && !isEventsLoading) {
      setIsLoading(false);
    }
  }, [isStatsLoading, isAgentsLoading, isCommissionsLoading, isPoliciesLoading, isEventsLoading]);

  // Filter for today's events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaysEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate >= today && eventDate < tomorrow;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Generate chart data
  const getRecentCommissionData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return Array(6).fill(0).map((_, i) => {
      const monthIndex = (currentMonth - 5 + i + 12) % 12;
      return {
        name: months[monthIndex],
        amount: Math.floor(Math.random() * 15000) + 5000
      };
    });
  };

  const getPolicyTypeData = () => {
    const policyTypes = ['Term Life', 'Whole Life', 'Universal Life', 'Variable Life', 'Final Expense'];
    return policyTypes.map(type => ({
      name: type,
      value: Math.floor(Math.random() * 30) + 10
    }));
  };

  // Calculate metrics
  const totalCommissions = commissions.reduce((sum, commission) => {
    return sum + parseFloat(commission.amount.replace(/[^0-9.-]+/g, "") || "0");
  }, 0);

  const newPoliciesThisMonth = policies.filter(policy => {
    const policyDate = new Date(policy.createdAt);
    const currentDate = new Date();
    return policyDate.getMonth() === currentDate.getMonth() && 
           policyDate.getFullYear() === currentDate.getFullYear();
  }).length;

  const commissionData = getRecentCommissionData();
  const policyTypeData = getPolicyTypeData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your broker dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gradient-to-b from-blue-50 to-white">
      {/* Broker dashboard banner */}
      <div className="bg-primary p-6 rounded-lg shadow-md text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Broker Dashboard
            </h2>
            <p className="mt-2 text-white/90">
              Welcome back, {user?.fullName || "Admin"}! Here's your brokerage summary.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" asChild>
              <Link href="/users">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Team Member
              </Link>
            </Button>
            <Button variant="secondary">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Quote Button */}
      <div className="my-6 flex justify-center">
        <Button 
          className="font-semibold px-12 py-4 text-xl h-auto bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full border-0"
          asChild
        >
          <Link href="/quotes">
            <FileText className="mr-3 h-6 w-6" />
            QUOTE
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Commissions
                </CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalCommissions.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +18.2% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Agents
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agents.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {agents.filter(a => a.active).length} currently online
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Policies
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {policies.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {newPoliciesThisMonth} new this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Agency Growth
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  +24%
                </div>
                <p className="text-xs text-muted-foreground">
                  Year over year growth
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Commissions Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={commissionData}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${value}`, 'Commissions']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar
                      dataKey="amount"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Policy Distribution</CardTitle>
                <CardDescription>
                  Breakdown by policy type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={policyTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {policyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Agent Status</CardTitle>
                <CardDescription>
                  Current online status of your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentStatusList />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  Your appointments for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysEvents.length > 0 ? (
                    todaysEvents.slice(0, 4).map((event, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="rounded-full p-1 bg-primary/10">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No events scheduled for today</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Management</CardTitle>
              <CardDescription>Manage your team of insurance agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button asChild className="ml-auto">
                  <Link href="/users">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add New Agent
                  </Link>
                </Button>
              </div>
              <div className="space-y-4">
                <AgentStatusList />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <TaskManagement />
        </TabsContent>

        <TabsContent value="commissions">
          <CalendarCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
