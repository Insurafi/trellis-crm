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
const formatCurrency = (amount: number | string | undefined) => {
  if (amount === undefined) return "$0";
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

// Define types for our data
interface Agent {
  id: number;
  fullName?: string;
  [key: string]: any;
}

interface SalesData {
  date: string;
  policies: number;
  premium: number;
  commissions: number;
}

interface ConversionData {
  name: string;
  value: number;
}

interface PolicyTypeData {
  name: string;
  value: number;
}

interface SummaryStats {
  totalPolicies: number;
  totalPremium: number;
  totalCommissions: number;
  conversionRate: number;
  avgPolicyValue: number;
  periodDescription: string;
}

export default function AgentPerformancePage() {
  const { id } = useParams<{ id: string }>();
  const [dateRange, setDateRange] = useState("30d"); // Default to 30 days

  // Fetch agent details
  const { data: agent, isLoading: isLoadingAgent } = useQuery<Agent>({
    queryKey: [`/api/agents/${id}`],
    enabled: !!id
  });

  // Fetch agent's sales performance data
  const { data: salesData, isLoading: isLoadingSales } = useQuery<SalesData[]>({
    queryKey: [`/api/analytics/sales/by-agent/${id}`, dateRange],
    enabled: !!id
  });

  // Fetch agent's conversion data
  const { data: conversionData, isLoading: isLoadingConversion } = useQuery<ConversionData[]>({
    queryKey: [`/api/analytics/conversion/by-agent/${id}`, dateRange],
    enabled: !!id
  });

  // Fetch agent's policy type distribution
  const { data: policyTypeData, isLoading: isLoadingPolicyTypes } = useQuery<PolicyTypeData[]>({
    queryKey: [`/api/analytics/policy-types/by-agent/${id}`, dateRange],
    enabled: !!id
  });

  // Fetch agent's summary statistics
  const { data: summaryStats, isLoading: isLoadingSummary } = useQuery<SummaryStats>({
    queryKey: [`/api/analytics/summary/by-agent/${id}`, dateRange],
    enabled: !!id
  });

  // We don't use any mock data - we'll handle empty states appropriately

  // Default stats if no data available
  const defaultStats: SummaryStats = {
    totalPolicies: 0,
    totalPremium: 0,
    totalCommissions: 0,
    conversionRate: 0,
    avgPolicyValue: 0,
    periodDescription: 'Last 30 days'
  };

  // Prepare summary statistics with real or default data
  const performanceStats: SummaryStats = summaryStats || defaultStats;

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
  
  // Check if the agent has actual performance data (policies sold)
  const hasPerformanceData = performanceStats.totalPolicies > 0;

  // If there's no performance data, show a message to the user instead of empty charts
  if (!hasPerformanceData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4" asChild>
            <Link href={`/agent-detail/${id}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Agent
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{agent.fullName || 'Agent'} Performance</h1>
        </div>
        
        <Card className="border-dashed border-2 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart4 className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">No Performance Data Available</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              This agent hasn't sold any policies yet. Performance metrics will appear here once the agent starts selling policies.
            </p>
            <Button variant="outline" asChild>
              <Link href={`/agent-detail/${id}`}>
                Return to Agent Profile
              </Link>
            </Button>
          </div>
        </Card>
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
              {!salesData || salesData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <BarChart4 className="h-24 w-24 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sales data available</h3>
                  <p className="text-center text-muted-foreground">
                    There is no sales data available for this time period.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip 
                      formatter={(value: any, name: any) => {
                        if (name === 'policies') return [value, 'Policies'];
                        if (typeof name === 'string') {
                          return [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)];
                        }
                        return [formatCurrency(value), String(name)];
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
              )}
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
              {!conversionData || conversionData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <PieChart className="h-24 w-24 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No conversion data available</h3>
                  <p className="text-center text-muted-foreground">
                    There is no lead conversion data available for this time period.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {conversionData.map((entry, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} leads`, ""]} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
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
              {!policyTypeData || policyTypeData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <BarChart4 className="h-24 w-24 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No policy type data available</h3>
                  <p className="text-center text-muted-foreground">
                    There is no policy distribution data available for this time period.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={policyTypeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value: any) => [`${value} policies`, ""]} />
                    <Legend />
                    <Bar dataKey="value" name="Policies Sold" fill="#8884d8">
                      {policyTypeData.map((entry, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}