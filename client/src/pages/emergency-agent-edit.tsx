import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EmergencyAgentEdit() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountType, setBankAccountType] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankRoutingNumber, setBankRoutingNumber] = useState("");
  
  // Load agent data
  const { data: agent } = useQuery({
    queryKey: [`/api/agents/${id}`],
    enabled: !!id
  });
  
  // When agent data is loaded, set form values
  useEffect(() => {
    if (agent) {
      console.log("Loaded agent data:", agent);
      
      // Special case for Aaron (agent ID 4) - the banking info in the database isn't his
      const isAaron = id === "4" || agent.userId === 13;
      
      // Set address fields but ALWAYS reset banking info for Aaron
      setAddress(agent.address || "");
      setCity(agent.city || "");
      setState(agent.state || "");
      setZipCode(agent.zipCode || "");
      
      // For Aaron, always set these to empty strings regardless of what's in the database
      if (isAaron) {
        setBankName("");
        setBankAccountType("");
        setBankAccountNumber("");
        setBankRoutingNumber("");
        console.log("Cleared banking info fields for Aaron");
      } else {
        // For other agents, use existing values
        setBankName(agent.bankName || "");
        setBankAccountType(agent.bankAccountType || "");
        setBankAccountNumber(agent.bankAccountNumber || "");
        setBankRoutingNumber(agent.bankRoutingNumber || "");
      }
    }
  }, [agent]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      const formData = {
        address,
        city,
        state,
        zipCode,
        bankName,
        bankAccountType,
        bankAccountNumber,
        bankRoutingNumber
      };
      
      console.log("Submitting data:", formData);
      
      // Use the emergency endpoint
      const response = await apiRequest(
        "POST",
        `/api/emergency/agent-update/${id}`,
        formData
      );
      
      console.log("Response:", response);
      
      setSuccess("Your information has been saved successfully!");
      toast({
        title: "Information updated",
        description: "Your information has been saved successfully!",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Error updating agent:", err);
      setError(err.message || "Failed to update information. Please try again.");
      toast({
        title: "Update failed",
        description: err.message || "Failed to update information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">
            Update Banking Information
          </h2>
          <p className="text-muted-foreground">
            Edit your address and banking information below
          </p>
        </div>
        <Button onClick={() => navigate(`/agent-detail/${id}`)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
      </div>
      
      <div className="p-4 mb-6 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-orange-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-orange-800">Important Notice</h3>
            <p className="text-orange-700">
              We need your correct address and banking information to process your commission payments. 
              Please fill out this form completely to ensure you receive your payments without delay.
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <div className="mb-6">
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div>
                <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
                <p className="text-blue-700 mb-2">
                  Your information has been saved successfully. Now you can:
                </p>
                <ul className="list-disc pl-5 text-blue-700 space-y-1">
                  <li>Return to your agent dashboard to view your leads and clients</li>
                  <li>Check your commission status in the Commissions tab</li>
                  <li>Contact support if you have any questions</li>
                </ul>
                <div className="mt-4 flex gap-3">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/agent-dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => navigate(`/agent-detail/${id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>Update your mailing address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input 
                  id="address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St" 
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Anytown" 
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA" 
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input 
                    id="zipCode" 
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="12345" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Banking Information</CardTitle>
            <CardDescription>Update your banking details for commission payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input 
                id="bankName" 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Chase, Wells Fargo, etc." 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Select 
                  value={bankAccountType} 
                  onValueChange={setBankAccountType}
                >
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Input
                  disabled
                  value="Direct Deposit"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input 
                  id="routingNumber" 
                  value={bankRoutingNumber}
                  onChange={(e) => setBankRoutingNumber(e.target.value)}
                  placeholder="9-digit routing number" 
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input 
                  id="accountNumber" 
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Account number" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(`/agent-detail/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 px-6 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Information"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}