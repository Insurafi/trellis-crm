import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, subDays, subMonths, subYears } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Download, Filter, ArrowDownUp, RefreshCw, PieChart, TrendingUp, Activity, DollarSign, Users, Target, BarChart3, UserCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "@/hooks/use-auth";

export default function AnalyticsPage() {
  const { isAdmin, isTeamLeader } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");
  const [businessMetric, setBusinessMetric] = useState<string>("sales");
  
  // Fetch analytics data
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ["/api/analytics/sales", dateRange],
    enabled: businessMetric === "sales" || businessMetric === "all",
  });
  
  const { data: conversionData = [], isLoading: isLoadingConversion } = useQuery({
    queryKey: ["/api/analytics/conversion", dateRange],
    enabled: businessMetric === "conversion" || businessMetric === "all",
  });
  
  const { data: policyTypeData = [], isLoading: isLoadingPolicyTypes } = useQuery({
    queryKey: ["/api/analytics/policy-types", dateRange],
    enabled: businessMetric === "policy-types" || businessMetric === "all",
  });
  
  const { data: agentPerformanceData = [], isLoading: isLoadingAgentPerformance } = useQuery({
    queryKey: ["/api/analytics/agent-performance", dateRange],
    enabled: (isAdmin || isTeamLeader) && (businessMetric === "agent-performance" || businessMetric === "all"),
  });
  
  // Fetch dashboard summary stats
  const { data: dashboardSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["/api/analytics/dashboard-summary", dateRange],
    enabled: true,
  });

  // Mock data for visualization until the API endpoints are implemented
  const mockSalesData = [
    { name: "Jan", policies: 65, premium: 4000, commissions: 2400 },
    { name: "Feb", policies: 59, premium: 3000, commissions: 1398 },
    { name: "Mar", policies: 80, premium: 5000, commissions: 3800 },
    { name: "Apr", policies: 81, premium: 5100, commissions: 3900 },
    { name: "May", policies: 56, premium: 2500, commissions: 1500 },
    { name: "Jun", policies: 55, premium: 2400, commissions: 1400 },
    { name: "Jul", policies: 40, premium: 2000, commissions: 1300 },
    { name: "Aug", policies: 75, premium: 4900, commissions: 2900 },
    { name: "Sep", policies: 88, premium: 6000, commissions: 4200 },
    { name: "Oct", policies: 90, premium: 7000, commissions: 5300 },
    { name: "Nov", policies: 93, premium: 7200, commissions: 5400 },
    { name: "Dec", policies: 105, premium: 9800, commissions: 7200 },
  ];

  const mockConversionData = [
    { name: "Leads", value: 1200 },
    { name: "Contacts", value: 800 },
    { name: "Quotes", value: 600 },
    { name: "Applications", value: 300 },
    { name: "Policies", value: 150 },
  ];

  const mockFunnelData = [
    { name: "Impressions", value: 5000 },
    { name: "Website Visits", value: 3500 },
    { name: "MQL", value: 2200 },
    { name: "SQL", value: 1400 },
    { name: "Opportunities", value: 800 },
    { name: "Closed Won", value: 200 },
  ];

  const mockPolicyTypeData = [
    { name: "Term Life", value: 40 },
    { name: "Whole Life", value: 30 },
    { name: "IUL", value: 20 },
    { name: "VUL", value: 10 },
  ];

  const mockAgentData = [
    { name: "James Wilson", policies: 24, premium: 125000, commissions: 43750, conversion: 28 },
    { name: "Sarah Miller", policies: 19, premium: 98000, commissions: 34300, conversion: 22 },
    { name: "Michael Brown", policies: 22, premium: 110000, commissions: 38500, conversion: 25 },
    { name: "Emma Davis", policies: 15, premium: 85000, commissions: 29750, conversion: 18 },
    { name: "Robert Johnson", policies: 28, premium: 140000, commissions: 49000, conversion: 30 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper function to format percentages
  const formatPercent = (value: number) => {
    return `${value}%`;
  };

  // Business metrics for this period - use real data if available, fallback to calculated values if not
  const totalPolicies = dashboardSummary?.totalPolicies || 0;
  const totalPremium = dashboardSummary?.totalPremium || 0;
  const totalCommissions = dashboardSummary?.totalCommissions || 0;
  const avgPremiumPerPolicy = dashboardSummary?.avgPolicyValue || 0;
  const conversionRate = dashboardSummary?.conversionRate || 0;
  
  // Calculate period description based on dateRange
  const getPeriodDescription = () => {
    switch(dateRange) {
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "90d": return "Last 90 days";
      case "1y": return "Last 12 months";
      case "all": return "All time";
      default: return "Current period";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive data insights and business intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={dateRange}
            onValueChange={(value) => setDateRange(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Custom Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Business Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Policies
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPolicies}</div>
            <div className="text-xs text-muted-foreground">
              {getPeriodDescription()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Premium
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPremium)}</div>
            <div className="text-xs text-muted-foreground">
              {getPeriodDescription()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Commissions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
            <div className="text-xs text-muted-foreground">
              {getPeriodDescription()}
            </div>
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
            <div className="text-2xl font-bold">{formatPercent(conversionRate)}</div>
            <div className="text-xs text-muted-foreground">
              {getPeriodDescription()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales" onClick={() => setBusinessMetric("sales")}>Sales & Revenue</TabsTrigger>
          <TabsTrigger value="conversion" onClick={() => setBusinessMetric("conversion")}>Conversion Funnel</TabsTrigger>
          <TabsTrigger value="policy-types" onClick={() => setBusinessMetric("policy-types")}>Policy Mix</TabsTrigger>
          {(isAdmin || isTeamLeader) && (
            <TabsTrigger value="agent-performance" onClick={() => setBusinessMetric("agent-performance")}>Agent Performance</TabsTrigger>
          )}
        </TabsList>
        
        {/* Sales & Revenue Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Policy Sales & Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly breakdown of policy count and premium for {getPeriodDescription()}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData.length > 0 ? salesData : mockSalesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'premium' || name === 'commissions') {
                        return [formatCurrency(value as number), name];
                      }
                      return [value, name];
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="policies" name="Policies Sold" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="premium" name="Premium ($)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Premium By Month</CardTitle>
                <CardDescription>
                  Monthly premium volume over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mockSalesData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, "Premium"]} />
                    <Area type="monotone" dataKey="premium" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission By Month</CardTitle>
                <CardDescription>
                  Monthly commission earnings over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mockSalesData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, "Commission"]} />
                    <Area type="monotone" dataKey="commissions" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Conversion Funnel Tab */}
        <TabsContent value="conversion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Lead to Policy Conversion</CardTitle>
                <CardDescription>
                  Conversion metrics across the sales funnel for {getPeriodDescription()}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockConversionData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 70,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate Analysis</CardTitle>
                <CardDescription>
                  Stage-by-stage conversion percentages
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Leads to Contact</span>
                      <span className="font-medium">66.7%</span>
                    </div>
                    <div className="h-2 bg-primary/10 rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: "66.7%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Contact to Quote</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <div className="h-2 bg-primary/10 rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Quote to Application</span>
                      <span className="font-medium">50%</span>
                    </div>
                    <div className="h-2 bg-primary/10 rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: "50%" }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Application to Policy</span>
                      <span className="font-medium">50%</span>
                    </div>
                    <div className="h-2 bg-primary/10 rounded-full">
                      <div className="h-full bg-primary rounded-full" style={{ width: "50%" }} />
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Overall Conversion</span>
                      <span className="font-bold">12.5%</span>
                    </div>
                    <div className="h-3 bg-primary/10 rounded-full mt-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: "12.5%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Marketing Funnel Analysis</CardTitle>
              <CardDescription>
                Full funnel from marketing impressions to closed policies
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockFunnelData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Policy Mix Tab */}
        <TabsContent value="policy-types" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Policy Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown of policies by type for {getPeriodDescription()}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={mockPolicyTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockPolicyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} policies`, 'Count']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Policy Type Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of policy types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPolicyTypeData.map((type, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type.name}</span>
                        <span>{type.value} policies</span>
                      </div>
                      <div className="flex items-center">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(type.value / mockPolicyTypeData.reduce((acc, curr) => acc + curr.value, 0)) * 100}%`,
                            backgroundColor: COLORS[i % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-4 border-t border-border">
                    <div className="flex items-center justify-between font-medium">
                      <span>Total Policies</span>
                      <span>{mockPolicyTypeData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Policy Type Trends</CardTitle>
              <CardDescription>
                How policy mix has changed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: 'Jan', term: 10, whole: 8, iul: 5, vul: 2 },
                    { month: 'Feb', term: 12, whole: 7, iul: 6, vul: 2 },
                    { month: 'Mar', term: 15, whole: 9, iul: 8, vul: 3 },
                    { month: 'Apr', term: 18, whole: 10, iul: 9, vul: 4 },
                    { month: 'May', term: 20, whole: 12, iul: 10, vul: 5 },
                    { month: 'Jun', term: 22, whole: 15, iul: 12, vul: 6 },
                  ]}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="term" name="Term Life" stroke="#0088FE" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="whole" name="Whole Life" stroke="#00C49F" />
                  <Line type="monotone" dataKey="iul" name="IUL" stroke="#FFBB28" />
                  <Line type="monotone" dataKey="vul" name="VUL" stroke="#FF8042" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Agent Performance Tab (Admin/Team Leader only) */}
        {(isAdmin || isTeamLeader) && (
          <TabsContent value="agent-performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>
                  Compare agent performance metrics for {getPeriodDescription()}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockAgentData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'premium' || name === 'commissions') {
                        return [formatCurrency(value as number), name];
                      }
                      return [value, name];
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="policies" name="Policies Sold" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="premium" name="Premium ($)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Conversion Rates by Agent</CardTitle>
                  <CardDescription>
                    Lead-to-policy conversion percentage by agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockAgentData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, "Conversion Rate"]} />
                      <Bar dataKey="conversion" name="Conversion Rate (%)" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>
                    Agents ranked by premium volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {mockAgentData
                      .sort((a, b) => b.premium - a.premium)
                      .slice(0, 3)
                      .map((agent, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {index + 1}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium leading-none">{agent.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatCurrency(agent.premium)} in premium
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {agent.policies} policies • {agent.conversion}% conversion
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <UserCheck className="mr-2 h-4 w-4" />
                    View All Agents
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}