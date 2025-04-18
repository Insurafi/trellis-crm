import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { 
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Award,
  User,
  Calendar,
  PieChart,
  ClipboardList,
  FileText,
  BookOpen,
  Edit,
  BarChart4,
  PlusCircle,
  Save,
  Pencil,
  X,
  Star,
  MessageSquare,
  Landmark,
  AlertTriangle,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

// Helper functions for formatting bank info
function formatBankAccountType(type: string | null | undefined): string {
  if (!type) return "";
  
  const typeMap: Record<string, string> = {
    'checking': 'Checking',
    'savings': 'Savings'
  };
  
  return typeMap[type] || type;
}

function formatPaymentMethod(method: string | null | undefined): string {
  // Always return Direct Deposit regardless of the input since it's the only allowed option
  return "Direct Deposit";
}

export default function AgentDetail() {
  const [_, params] = useRoute("/agent-detail/:id");
  const agentId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Commission editing
  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [commissionValue, setCommissionValue] = useState("60.00");
  const commissionInputRef = useRef<HTMLInputElement>(null);
  
  // Bank info editing
  const [isEditingBankInfo, setIsEditingBankInfo] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    bankAccountType: "",
    bankAccountNumber: "",
    bankRoutingNumber: "",
    bankPaymentMethod: "direct_deposit" // Set Direct Deposit as default payment method
  });

  // Fetch agent data using the new API endpoint to avoid routing conflicts
  const { data: agent, isLoading: isAgentLoading } = useQuery<any>({
    queryKey: [`/api/agent-data/${agentId}`],
    enabled: !!agentId
  });
  
  // Update commission value when agent data loads
  useEffect(() => {
    if (agent?.commissionPercentage) {
      setCommissionValue(agent.commissionPercentage);
    }
    
    // Initialize bank info from agent data when loaded
    if (agent) {
      setBankInfo({
        bankName: agent.bankName || "",
        bankAccountType: agent.bankAccountType || "",
        bankAccountNumber: agent.bankAccountNumber || "",
        bankRoutingNumber: agent.bankRoutingNumber || "",
        bankPaymentMethod: agent.bankPaymentMethod || "direct_deposit" // Default to Direct Deposit
      });
    }
  }, [agent]);
  
  // Update agent commission
  const updateCommissionMutation = useMutation({
    mutationFn: async (newCommission: string) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/agents/${agentId}/commission`, 
        { commissionPercentage: newCommission }
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate both endpoints to ensure data consistency
      queryClient.invalidateQueries({ queryKey: [`/api/agent-data/${agentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Commission updated",
        description: `Agent commission has been set to ${commissionValue}%`,
        variant: "default",
      });
      setIsEditingCommission(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Unable to update agent commission. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update bank information
  const updateBankInfoMutation = useMutation({
    mutationFn: async (bankData: {
      bankName?: string;
      bankAccountType?: string;
      bankAccountNumber?: string;
      bankRoutingNumber?: string;
      bankPaymentMethod?: string;
    }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/agents/${agentId}/banking-info`, 
        bankData
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate both endpoints to ensure data consistency
      queryClient.invalidateQueries({ queryKey: [`/api/agent-data/${agentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Banking details updated",
        description: "Your banking information has been saved successfully.",
        variant: "default",
      });
      setIsEditingBankInfo(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Unable to update banking information. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Fetch agent's clients
  const { data: agentClients = [], isLoading: isClientsLoading } = useQuery<any[]>({
    queryKey: [`/api/clients/by-agent/${agentId}`],
    enabled: !!agentId,
  });

  // Fetch agent's policies
  const { data: agentPolicies = [], isLoading: isPoliciesLoading } = useQuery<any[]>({
    queryKey: [`/api/policies/by-agent/${agentId}`],
    enabled: !!agentId,
  });

  // Fetch agent's leads
  const { data: agentLeads = [], isLoading: isLeadsLoading } = useQuery<any[]>({
    queryKey: [`/api/leads/by-agent/${agentId}`],
    enabled: !!agentId,
  });
  
  // Fetch agent's weekly commissions
  const { data: weeklyCommissionData = [], isLoading: isCommissionsLoading } = useQuery<any[]>({
    queryKey: [`/api/commissions/weekly/by-agent/${agentId}`],
    enabled: !!agentId,
  });

  const isLoading = isAgentLoading || isClientsLoading || isPoliciesLoading || isLeadsLoading || isCommissionsLoading;

  // Real performance data based on actual agent activity
  // No mock or random data is used - all data comes from the agent's actual sales and activities

  // Calculate actual metrics based on real agent data (no mock data)
  // Get total premium from actual policies
  const totalPremium = agentPolicies.reduce((sum: number, policy: any) => {
    // Extract numeric value from premium string (e.g., "$1,200" -> 1200)
    const premiumValue = policy.premium ? parseFloat(policy.premium.replace(/[^0-9.-]+/g, "")) : 0;
    return sum + premiumValue;
  }, 0);
  
  // Get total commissions from actual policies
  // Calculate commissions based on premium if commission value not available
  const totalCommission = agentPolicies.reduce((sum: number, policy: any) => {
    // If commission is directly available, use it
    if (policy.commission) {
      return sum + parseFloat(policy.commission);
    }
    
    // Otherwise calculate commission as percentage of premium (using agent's commission rate)
    const premium = policy.premium ? parseFloat(policy.premium.replace(/[^0-9.-]+/g, "")) : 0;
    const commissionRate = parseFloat(agent?.commissionPercentage || "60") / 100;
    return sum + (premium * commissionRate);
  }, 0);
  
  // Set realistic targets or use the agent's actual values as targets
  // For agents with policies, we use their current values + modest growth
  // For agents with no policies, we use relatively low default values
  const hasPolicies = agentPolicies.length > 0;
  
  // If agent has policies, set 50% higher than current as target, otherwise use standard defaults
  const policyTarget = hasPolicies ? Math.max(Math.ceil(agentPolicies.length * 1.5), 5) : 5;
  const premiumTarget = hasPolicies ? Math.max(Math.ceil(totalPremium * 1.5), 5000) : 5000;
  const commissionTarget = hasPolicies ? Math.max(Math.ceil(totalCommission * 1.5), 1000) : 1000;
  
  // Calculate progress percentages based on actual data
  const policyProgress = Math.min(100, Math.round((agentPolicies.length / policyTarget) * 100));
  const premiumProgress = Math.min(100, Math.round((totalPremium / premiumTarget) * 100));
  const commissionProgress = Math.min(100, Math.round((totalCommission / commissionTarget) * 100));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
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
    <div className="p-4 md:p-8 pt-6 space-y-6">
      {/* Special notification banner for Aaron (ID 4) */}
      {agent.id === 4 && (
        <Card className="border-orange-300 bg-orange-50 mb-6">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-800 mb-1">Banking Information Required</h3>
                <p className="text-orange-700 mb-2">
                  Please complete your banking information to receive commission payments. This is required for all agents.
                </p>
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" asChild>
                  <Link href={`/emergency-agent-edit/${agent.id}`}>
                    Update Banking Information
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Back button and page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/agents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Agent Profile</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          {agent.id === 4 ? (
            <Button size="sm" asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href={`/emergency-agent-edit/${agent.id}`}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergency Fix
              </Link>
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href={`/agent-edit/${agent.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Agent profile section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-semibold">
                {agent.fullName?.charAt(0) || agent.name?.charAt(0) || "A"}
              </div>
            </div>
            <CardTitle className="text-xl">{agent.fullName || agent.name || "Agent"}</CardTitle>
            <CardDescription>Insurance Agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">License #</p>
                <p className="font-medium">{agent.licenseNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  <span className="font-medium">Active</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{agent.phoneNumber || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium truncate">{agent.email || "Not provided"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Upline Agent</p>
                <p className="font-medium">{agent.uplineAgentId ? `Agent #${agent.uplineAgentId}` : "None"}</p>
              </div>
              
              <div className="col-span-2 p-3 rounded-lg border border-blue-200 bg-blue-50">
                <p className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-blue-600" />
                  Specialties
                </p>
                <div className="flex flex-wrap gap-2">
                  {agent.specialties ? 
                    agent.specialties.split(',').map((specialty: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                        {specialty.trim()}
                      </span>
                    )) : 
                    <div className="text-sm text-blue-700">No specialties listed</div>
                  }
                </div>
              </div>
              <div className="col-span-2 mt-3 bg-primary/5 rounded-lg p-3 border border-primary/10">
                <div className="flex justify-between items-center">
                  <p className="text-base font-semibold flex items-center">
                    <PieChart className="h-4 w-4 mr-2 text-primary" />
                    Commission Rate
                  </p>
                  {user?.role === 'admin' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => {
                        setIsEditingCommission(!isEditingCommission);
                        // Focus the input when editing starts
                        if (!isEditingCommission) {
                          setTimeout(() => commissionInputRef.current?.focus(), 0);
                        }
                      }}
                    >
                      {isEditingCommission ? (
                        <X className="h-3.5 w-3.5" />
                      ) : (
                        <Pencil className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
                
                {isEditingCommission ? (
                  <div className="flex mt-2">
                    <input 
                      ref={commissionInputRef}
                      type="number" 
                      value={commissionValue}
                      onChange={(e) => setCommissionValue(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary" 
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <Button 
                      size="sm"
                      className="rounded-l-none h-[34px]"
                      disabled={updateCommissionMutation.isPending}
                      onClick={() => updateCommissionMutation.mutate(commissionValue)}
                    >
                      {updateCommissionMutation.isPending ? (
                        <div className="h-4 w-4 border-t-2 border-white rounded-full animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-primary mt-1">{agent.commissionPercentage || "60.00"}%</p>
                )}
              </div>
              
              <div className="col-span-2 mt-3 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <div className="flex justify-between items-center">
                  <p className="text-base font-semibold flex items-center text-emerald-700">
                    <Landmark className="h-4 w-4 mr-2" />
                    Banking Details
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-emerald-700"
                    onClick={() => setIsEditingBankInfo(!isEditingBankInfo)}
                  >
                    {isEditingBankInfo ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      <Pencil className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                
                {isEditingBankInfo ? (
                  <div className="mt-3 space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="bankName" className="text-sm font-medium text-emerald-800">Bank Name</label>
                      <input 
                        id="bankName" 
                        type="text" 
                        value={bankInfo.bankName || ''} 
                        onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Enter bank name"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="accountType" className="text-sm font-medium text-emerald-800">Account Type</label>
                      <select 
                        id="accountType" 
                        value={bankInfo.bankAccountType || ''} 
                        onChange={(e) => setBankInfo({...bankInfo, bankAccountType: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Select account type</option>
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="accountNumber" className="text-sm font-medium text-emerald-800">Account Number</label>
                      <input 
                        id="accountNumber" 
                        type="text" 
                        value={bankInfo.bankAccountNumber || ''} 
                        onChange={(e) => setBankInfo({...bankInfo, bankAccountNumber: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Enter account number"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="routingNumber" className="text-sm font-medium text-emerald-800">Routing Number</label>
                      <input 
                        id="routingNumber" 
                        type="text" 
                        value={bankInfo.bankRoutingNumber || ''} 
                        onChange={(e) => setBankInfo({...bankInfo, bankRoutingNumber: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Enter routing number"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="paymentMethod" className="text-sm font-medium text-emerald-800">Payment Method</label>
                      <select 
                        id="paymentMethod" 
                        value="direct_deposit" 
                        onChange={(e) => setBankInfo({...bankInfo, bankPaymentMethod: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        disabled
                      >
                        <option value="direct_deposit">Direct Deposit</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={updateBankInfoMutation.isPending}
                        onClick={() => updateBankInfoMutation.mutate({
                          ...bankInfo,
                          bankPaymentMethod: "direct_deposit" // Always use direct deposit
                        })}
                      >
                        {updateBankInfoMutation.isPending ? (
                          <div className="h-4 w-4 border-t-2 border-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5 mr-1.5" />
                            Save Banking Details
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-800">Account Type:</span>
                      <span className="text-sm font-medium text-emerald-800">
                        {formatBankAccountType(agent.bankAccountType) || "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-800">Bank Name:</span>
                      <span className="text-sm font-medium text-emerald-800">
                        {agent.bankName || "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-800">Account Number:</span>
                      <span className="text-sm font-medium text-emerald-800">
                        {agent.bankAccountNumber ? "****" + agent.bankAccountNumber.slice(-4) : "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-800">Routing Number:</span>
                      <span className="text-sm font-medium text-emerald-800">
                        {agent.bankRoutingNumber ? "****" + agent.bankRoutingNumber.slice(-4) : "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-800">Payment Method:</span>
                      <span className="text-sm font-medium text-emerald-800">
                        {formatPaymentMethod(agent.bankPaymentMethod) || "Not provided"}
                      </span>
                    </div>
                    
                    {!agent.bankName && !agent.bankAccountNumber && (
                      <div className="mt-3 text-center py-2 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-700">No banking information has been added yet.</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Add your banking details to receive commission payments.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-base font-semibold flex items-center mb-3">
                <Award className="h-4 w-4 mr-2 text-primary" />
                Licensed to Sell in:
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {agent.licensedStates ? 
                  agent.licensedStates.split(',').map((state: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                      {state.trim()}
                    </span>
                  )) : 
                  <div className="flex items-center text-sm text-muted-foreground bg-gray-100 px-3 py-2 rounded-md w-full">
                    <PlusCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    No licensed states recorded
                  </div>
                }
              </div>
            </div>
            
            {/* Performance Metrics - Always shown but with actual data */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Performance Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Policies</span>
                    <span>{agentPolicies.length}</span>
                  </div>
                  <Progress value={policyProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Premium</span>
                    <span>${totalPremium.toLocaleString()}</span>
                  </div>
                  <Progress value={premiumProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Commissions</span>
                    <span>${totalCommission.toLocaleString()}</span>
                  </div>
                  <Progress value={commissionProgress} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
          {/* Always show Performance Button */}
          <CardFooter className="flex justify-center border-t pt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/agents/${agent.id}/performance`}>
                <BarChart4 className="mr-2 h-4 w-4" />
                View Full Performance
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Main content area */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Summary</CardTitle>
              <CardDescription>
                {agentPolicies.length > 0 
                  ? `${agent.fullName || agent.name || "Agent"} has ${agentPolicies.length} active policies`
                  : `${agent.fullName || agent.name || "Agent"}'s activity summary`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Clients</span>
                    <Briefcase className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{agentClients.length}</div>
                  <div className="text-xs text-blue-600 mt-1">Active clients</div>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-700">Policies</span>
                    <FileText className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-700">{agentPolicies.length}</div>
                  <div className="text-xs text-emerald-600 mt-1">Active policies</div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-700">Leads</span>
                    <User className="h-4 w-4 text-amber-700" />
                  </div>
                  <div className="text-2xl font-bold text-amber-700">{agentLeads.length}</div>
                  <div className="text-xs text-amber-600 mt-1">Current leads</div>
                </div>
              </div>

              <h3 className="font-medium text-sm mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {agentPolicies.length > 0 ? (
                  // Show the most recent policies as activity
                  agentPolicies.slice(0, 3).map((policy: any, index: number) => (
                    <div key={index} className="flex items-start p-2 hover:bg-gray-50 rounded-md">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sold {policy.policyType || "Insurance"} Policy</p>
                        <p className="text-xs text-muted-foreground">
                          Policy #: {policy.policyNumber || "Unknown"} • Premium: ${parseFloat(policy.premium || "0").toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Show "No recent activity" message if there are no policies
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No recent activity recorded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="commissions">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="commissions">Commissions</TabsTrigger>
              <TabsTrigger value="products">Top Products</TabsTrigger>
              <TabsTrigger value="clients">Recent Clients</TabsTrigger>
            </TabsList>
            
            <TabsContent value="commissions" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Commission History</CardTitle>
                  <CardDescription>Weekly commissions earned by this agent</CardDescription>
                </CardHeader>
                <CardContent>
                  {weeklyCommissionData.length > 0 ? (
                    <div>
                      {/* Just show the first/latest commission entry */}
                      {(() => {
                        const commission = weeklyCommissionData[0];
                        const agentAmount = parseFloat(commission.amount || "0") * 0.6;
                        const companyAmount = parseFloat(commission.amount || "0") * 0.4;
                        
                        // Format weekStartDate and weekEndDate as MM/DD/YYYY
                        let dateRange = "";
                        if (commission.weekStartDate && commission.weekEndDate) {
                          const startDate = new Date(commission.weekStartDate);
                          const endDate = new Date(commission.weekEndDate);
                          dateRange = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;
                        } else {
                          // Fallback to current date range
                          const now = new Date();
                          const lastWeek = new Date(now);
                          lastWeek.setDate(now.getDate() - 7);
                          dateRange = `${lastWeek.getMonth() + 1}/${lastWeek.getDate()} - ${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
                        }
                        
                        return (
                          <div className="p-4 border rounded-lg">
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{dateRange}</h4>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    commission.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {commission.status === 'paid' ? 'Paid' : 'Pending'}
                                  </span>
                                  <span className="text-md font-bold">${commission.amount?.toLocaleString() || "0.00"}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-3 mt-2">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                    <p className="text-sm text-muted-foreground mb-1">Agent Share (60%)</p>
                                    <p className="text-xl font-bold text-primary">${agentAmount.toFixed(2)}</p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-gray-100 border border-gray-200">
                                    <p className="text-sm text-muted-foreground mb-1">Company Share (40%)</p>
                                    <p className="text-xl font-bold">${companyAmount.toFixed(2)}</p>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-1 mt-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Policy Count:</span>
                                    <span className="font-medium">{commission.policyCount || "0"}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Premium Volume:</span>
                                    <span className="font-medium">${commission.premiumVolume?.toLocaleString() || "0.00"}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Commission Period:</span>
                                    <span className="font-medium">{commission.period || "Weekly"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-1">No commission data found</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        This agent hasn't earned any commissions yet or the commission data hasn't been recorded.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button className="w-full" asChild>
                    <Link href="/commissions">
                      <PieChart className="mr-2 h-4 w-4" />
                      View All Commissions
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="products" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>Agent's most successful insurance products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-1">No product data yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      This agent hasn't ranked their top-performing products yet.
                    </p>
                    <div className="mt-6">
                      <Button variant="outline" className="mr-2">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clients" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Clients</CardTitle>
                  <CardDescription>Latest client interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {agentClients.length > 0 ? (
                    <div className="space-y-4">
                      {agentClients.slice(0, 5).map((client: any) => (
                        <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                              {client.name?.charAt(0) || "C"}
                            </div>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-xs text-muted-foreground">{client.email}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/clients/${client.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <h3 className="font-medium mb-1">No clients found</h3>
                      <p className="text-sm text-muted-foreground">This agent hasn't been assigned any clients yet.</p>
                    </div>
                  )}
                </CardContent>
                {agentClients.length > 0 && (
                  <CardFooter className="flex justify-center border-t pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/clients?agentId=${agent.id}`}>
                        View All Clients
                      </Link>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            
            {/* Weekly Activity tab removed */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}