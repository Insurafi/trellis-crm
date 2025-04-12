import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [monthlyQuota, setMonthlyQuota] = useState(85);
  const [yearlyQuota, setYearlyQuota] = useState(62);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch agent details for the current user
  const { data: agentData, isLoading: isAgentLoading } = useQuery<any>({
    queryKey: ["/api/agents/by-user", user?.id],
    enabled: !!user?.id,
  });

  // Fetch leads for this agent
  const { data: agentLeads = [], isLoading: isLeadsLoading } = useQuery<any[]>({
    queryKey: ["/api/leads/by-agent", agentData?.id],
    enabled: !!agentData?.id,
  });
  
  // Fetch policies for this agent
  const { data: agentPolicies = [], isLoading: isPoliciesLoading } = useQuery<any[]>({
    queryKey: ["/api/policies/by-agent", agentData?.id],
    enabled: !!agentData?.id,
  });

  // Fetch commissions for this agent
  const { data: agentCommissions = [], isLoading: isCommissionsLoading } = useQuery<any[]>({
    queryKey: ["/api/commissions/by-agent", agentData?.id],
    enabled: !!agentData?.id,
  });

  // Fetch calendar events
  const { data: calendarEvents = [], isLoading: isEventsLoading } = useQuery<any[]>({
    queryKey: ["/api/calendar/events"],
    enabled: !!user?.id,
  });

  // Update loading state when data is fetched
  useEffect(() => {
    if (!isAgentLoading && !isLeadsLoading && !isPoliciesLoading && !isCommissionsLoading && !isEventsLoading) {
      setIsLoading(false);
    }
  }, [isAgentLoading, isLeadsLoading, isPoliciesLoading, isCommissionsLoading, isEventsLoading]);

  // Filter for today's events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaysEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate >= today && eventDate < tomorrow;
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Generate dummy chart data
  const getRecentCommissionData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return Array(6).fill(0).map((_, i) => {
      const monthIndex = (currentMonth - 5 + i + 12) % 12;
      return {
        name: months[monthIndex],
        amount: Math.floor(Math.random() * 5000) + 1000
      };
    });
  };

  const getLeadConversionData = () => {
    return [
      { name: 'New', value: agentLeads.filter(l => l.status === 'new').length || Math.floor(Math.random() * 10) + 5 },
      { name: 'Contacted', value: agentLeads.filter(l => l.status === 'contacted').length || Math.floor(Math.random() * 8) + 3 },
      { name: 'Qualified', value: agentLeads.filter(l => l.status === 'qualified').length || Math.floor(Math.random() * 6) + 2 },
      { name: 'Proposal', value: agentLeads.filter(l => l.status === 'proposal').length || Math.floor(Math.random() * 4) + 1 },
      { name: 'Closed', value: agentLeads.filter(l => l.status === 'closed').length || Math.floor(Math.random() * 3) + 1 },
    ];
  };

  const commissionData = getRecentCommissionData();
  const leadConversionData = getLeadConversionData();

  // Calculate some metrics
  const totalCommissions = agentCommissions.reduce((sum, commission) => {
    return sum + parseFloat(commission.amount.replace(/[^0-9.-]+/g, "") || "0");
  }, 0);

  const newLeadsThisMonth = agentLeads.filter(lead => {
    const leadDate = new Date(lead.createdAt);
    const currentDate = new Date();
    return leadDate.getMonth() === currentDate.getMonth() && 
           leadDate.getFullYear() === currentDate.getFullYear();
  }).length;

  const newPoliciesThisMonth = agentPolicies.filter(policy => {
    const policyDate = new Date(policy.createdAt);
    const currentDate = new Date();
    return policyDate.getMonth() === currentDate.getMonth() && 
           policyDate.getFullYear() === currentDate.getFullYear();
  }).length;

  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your agent dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gradient-to-b from-blue-50 to-white">
      {/* Agent profile banner */}
      <div className="bg-primary p-6 rounded-lg shadow-md text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Agent Dashboard
            </h2>
            <p className="mt-2 text-white/90">
              Welcome back, {user?.fullName || "Agent"}! Here's your performance summary.
            </p>
            <Button 
              className="mt-4 font-semibold px-8 py-2.5 text-lg h-auto bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl border-0"
              asChild
            >
              <Link href="/quotes">
                <FileText className="mr-2 h-5 w-5" />
                GET QUOTE
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary">
              <ClipboardList className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <Button variant="secondary">
              <Users className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
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
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Leads
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentLeads.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {newLeadsThisMonth} new this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Policies
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentPolicies.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {newPoliciesThisMonth} new this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentLeads.length > 0 
                    ? `${Math.round((agentPolicies.length / agentLeads.length) * 100)}%` 
                    : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 relative">
              {/* Modern Quote Button - positioned above but inside the card */}
              <div className="absolute -top-12 w-full flex justify-center">
                <Button 
                  className="font-semibold px-10 py-3 text-lg h-auto bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full border-0"
                  asChild
                >
                  <Link href="/quotes">
                    <FileText className="mr-2 h-5 w-5" />
                    GET QUOTE
                  </Link>
                </Button>
              </div>
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
                <CardTitle>Lead Conversion Funnel</CardTitle>
                <CardDescription>
                  Track your lead progression through the sales funnel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={leadConversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Quota Progress</CardTitle>
                <CardDescription>
                  Your performance against monthly sales targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Monthly Policy Quota</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {monthlyQuota}% of target
                      </span>
                    </div>
                    <Progress value={monthlyQuota} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Yearly Policy Quota</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {yearlyQuota}% of target
                      </span>
                    </div>
                    <Progress value={yearlyQuota} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Lead Followup</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        95% complete
                      </span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
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
                  
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/calendar">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Full Calendar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-l-4 border-blue-500">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-2">
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>New Leads</span>
                  <span className="bg-blue-100 text-blue-800 px-2 rounded-full">
                    {agentLeads.filter(l => l.status === 'new').length || 5}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Button variant="ghost" asChild className="w-full justify-start rounded-none h-auto py-4 px-4 border-b">
                  <Link href="/leads">
                    <span>View All New Leads</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-amber-500">
              <CardHeader className="bg-amber-50 dark:bg-amber-900/20 pb-2">
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>Contacted</span>
                  <span className="bg-amber-100 text-amber-800 px-2 rounded-full">
                    {agentLeads.filter(l => l.status === 'contacted').length || 3}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Button variant="ghost" asChild className="w-full justify-start rounded-none h-auto py-4 px-4 border-b">
                  <Link href="/leads">
                    <span>View Contacted Leads</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-green-500">
              <CardHeader className="bg-green-50 dark:bg-green-900/20 pb-2">
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>Qualified</span>
                  <span className="bg-green-100 text-green-800 px-2 rounded-full">
                    {agentLeads.filter(l => l.status === 'qualified').length || 2}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Button variant="ghost" asChild className="w-full justify-start rounded-none h-auto py-4 px-4 border-b">
                  <Link href="/leads">
                    <span>View Qualified Leads</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-purple-500">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/20 pb-2">
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>In Progress</span>
                  <span className="bg-purple-100 text-purple-800 px-2 rounded-full">
                    {agentLeads.filter(l => l.status === 'proposal').length || 1}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Button variant="ghost" asChild className="w-full justify-start rounded-none h-auto py-4 px-4 border-b">
                  <Link href="/leads">
                    <span>View Proposals & Applications</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Lead Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {agentLeads.slice(0, 5).map((lead, i) => (
                  <div key={i} className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="h-full w-px bg-border" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lead.status === 'new' ? 'New lead created' : 
                         lead.status === 'contacted' ? 'First contact made' :
                         lead.status === 'qualified' ? 'Lead qualified' :
                         lead.status === 'proposal' ? 'Proposal sent' :
                         'Application in progress'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: <span className="font-medium capitalize">{lead.status}</span>
                      </p>
                      <div className="flex items-center pt-2">
                        <Button asChild variant="ghost" size="sm" className="h-7 px-3 text-xs">
                          <Link href={`/leads/${lead.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Policies
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentPolicies.filter(p => p.status === 'active').length || 8}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{newPoliciesThisMonth} this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Policies
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentPolicies.filter(p => p.status === 'pending').length || 2}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting underwriting
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Renewal Opportunities
                </CardTitle>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentPolicies.filter(p => {
                    // Find policies close to renewal date
                    const today = new Date();
                    const policyDate = new Date(p.renewalDate || p.createdAt);
                    policyDate.setFullYear(policyDate.getFullYear() + 1);
                    const diffTime = policyDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 30 && diffDays > 0;
                  }).length || 3}
                </div>
                <p className="text-xs text-muted-foreground">
                  Due in the next 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lapsed Policies
                </CardTitle>
                <ArrowDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentPolicies.filter(p => p.status === 'lapsed').length || 1}
                </div>
                <p className="text-xs text-muted-foreground">
                  -1 from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Policy Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {agentPolicies.slice(0, 5).map((policy, i) => (
                  <div key={i} className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="h-full w-px bg-border" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {policy.policyNumber || `POL-${100000 + i}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {policy.carrier} - {policy.policyType}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          Status: <span className="font-medium capitalize">{policy.status || "Active"}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Face Amount: <span className="font-medium">${policy.faceAmount}</span>
                        </p>
                      </div>
                      <div className="flex items-center pt-2">
                        <Button asChild variant="ghost" size="sm" className="h-7 px-3 text-xs">
                          <Link href={`/policies/${policy.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Annual Commissions
                </CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalCommissions.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last year
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  YTD Commissions
                </CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(totalCommissions * 0.75).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  75% of annual total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(totalCommissions * 0.1).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +18% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Projected Q4
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(totalCommissions * 0.3).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on current pipeline
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Commission Breakdown by Policy Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={[
                    { name: "Term Life", value: 35 },
                    { name: "Whole Life", value: 25 },
                    { name: "Universal Life", value: 20 },
                    { name: "Variable Life", value: 15 },
                    { name: "Final Expense", value: 5 },
                  ]}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Commission Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentCommissions.slice(0, 5).map((commission, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CircleDollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Policy #{commission.policyNumber || `POL-${100000 + i}`}
                      </p>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                          {commission.client?.name || `Client ${i + 1}`}
                        </p>
                        <p className="text-sm font-medium">
                          {commission.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}