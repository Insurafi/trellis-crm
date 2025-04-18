import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { ChevronLeft, Zap, TrendingUp, PieChart, BarChart4, Calendar } from "lucide-react";
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

// Default color array for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#58D68D'];

// Format currency for display
const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

export default function AgentPerformancePage() {
  const { id } = useParams<{ id: string }>();
  const [dateRange, setDateRange] = useState("30d"); // Default to 30 days

  // Fetch agent details
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: [`/api/agents/${id}`],
    enabled: !!id
  });

  // Fetch agent's sales performance data
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: [`/api/analytics/sales/by-agent/${id}`, dateRange],
    enabled: !!id
  });

  // Fetch agent's conversion data
  const { data: conversionData, isLoading: isLoadingConversion } = useQuery({
    queryKey: [`/api/analytics/conversion/by-agent/${id}`, dateRange],
    enabled: !!id
  });

  // Fetch agent's policy type distribution
  const { data: policyTypeData, isLoading: isLoadingPolicyTypes } = useQuery({
    queryKey: [`/api/analytics/policy-types/by-agent/${id}`, dateRange],
    enabled: !!id
  });

  // Fetch agent's summary statistics
  const { data: summaryStats, isLoading: isLoadingSummary } = useQuery({
    queryKey: [`/api/analytics/summary/by-agent/${id}`, dateRange],
    enabled: !!id
  });

  // Generate mock data if real data is not available yet
  const mockSalesData = [
    { date: 'Week 1', policies: 3, premium: 4500, commissions: 1800 },
    { date: 'Week 2', policies: 2, premium: 3000, commissions: 1200 },
    { date: 'Week 3', policies: 4, premium: 6000, commissions: 2400 },
    { date: 'Week 4', policies: 3, premium: 4500, commissions: 1800 },
  ];

  const mockConversionData = [
    { name: 'Converted', value: 25 },
    { name: 'Pending', value: 30 },
    { name: 'Lost', value: 45 },
  ];

  const mockPolicyTypeData = [
    { name: 'Term Life', value: 40 },
    { name: 'Whole Life', value: 30 },
    { name: 'Universal Life', value: 20 },
    { name: 'Final Expense', value: 10 },
  ];

  // Prepare summary statistics with real or mock data
  const performanceStats = summaryStats || {
    totalPolicies: 12,
    totalPremium: 18000,
    totalCommissions: 7200,
    conversionRate: 25,
    avgPolicyValue: 1500,
    periodDescription: 'Last 30 days'
  };

  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const isLoading = isLoadingAgent || isLoadingSales || isLoadingConversion || 
                    isLoadingPolicyTypes || isLoadingSummary;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <BarChart4 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Agent Not Found</h2>
          <p className="text-muted-foreground mb-6">The agent you're looking for doesn't exist or you don't have access.</p>
          <Button asChild>
            <Link href="/agents">Back to Agents</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" className="mr-4" asChild>
            <Link href={`/agent-detail/${id}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Agent
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{agent.fullName || 'Agent'} Performance</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={dateRange === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDateRangeChange("7d")}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDateRangeChange("30d")}
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === "90d" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDateRangeChange("90d")}
          >
            90 Days
          </Button>
          <Button
            variant={dateRange === "ytd" ? "default" : "outline"}
            size="sm"
            onClick={() => handleDateRangeChange("ytd")}
          >
            Year to Date
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="mb-2 p-3 rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Total Policies</h3>
              <p className="text-3xl font-bold">{performanceStats.totalPolicies}</p>
              <p className="text-sm text-muted-foreground">{performanceStats.periodDescription}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="mb-2 p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Premium Volume</h3>
              <p className="text-3xl font-bold">{formatCurrency(performanceStats.totalPremium)}</p>
              <p className="text-sm text-muted-foreground">{performanceStats.periodDescription}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="mb-2 p-3 rounded-full bg-primary/10">
                <BarChart4 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Commissions</h3>
              <p className="text-3xl font-bold">{formatCurrency(performanceStats.totalCommissions)}</p>
              <p className="text-sm text-muted-foreground">{performanceStats.periodDescription}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="mb-2 p-3 rounded-full bg-primary/10">
                <PieChart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Conversion Rate</h3>
              <p className="text-3xl font-bold">{performanceStats.conversionRate}%</p>
              <p className="text-sm text-muted-foreground">{performanceStats.periodDescription}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Tabs */}
      <Tabs defaultValue="sales" className="mb-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="policy-types">Policy Types</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance Over Time</CardTitle>
              <CardDescription>
                Tracking policies sold, premium volume and commissions earned
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData || mockSalesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'policies') return [value, 'Policies'];
                      return [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)];
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="policies" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="premium" 
                    stroke="#82ca9d" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="commissions" 
                    stroke="#ffc658" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Lead Conversion Analysis</CardTitle>
              <CardDescription>
                Breakdown of leads by their current status
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={conversionData || mockConversionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(conversionData || mockConversionData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} leads`, ""]} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy-types">
          <Card>
            <CardHeader>
              <CardTitle>Policy Type Distribution</CardTitle>
              <CardDescription>
                Breakdown of different policy types sold
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={policyTypeData || mockPolicyTypeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value} policies`, ""]} />
                  <Legend />
                  <Bar dataKey="value" name="Policies Sold" fill="#8884d8">
                    {(policyTypeData || mockPolicyTypeData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}