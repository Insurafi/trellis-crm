import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Lead } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, Check, X, Clock, Eye, MapPin, FileText } from "lucide-react";

// Form schema
const leadFormSchema = z.object({
  // Only require essential fields (first name, last name, email, phone number, and state)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  state: z.string().min(1, "State is required"),
  
  // Make all other fields optional
  sex: z.string().optional(), // Added sex field (M/F)
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  smokerStatus: z.string().default("No"),
  medicalConditions: z.string().optional(),
  familyHistory: z.string().optional(),
  incomeRange: z.string().optional(),
  existingCoverage: z.string().optional(),
  coverageNeeds: z.string().optional(),
  insuranceTypeInterest: z.string().optional(),
  leadSource: z.string().default("Website"),
  assignedAgentId: z.number().nullable().optional(),
  status: z.string().default("Leads"),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const LeadsPage: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch leads
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads"],
  });

  // Fetch agents for dropdown
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/agents"],
  });

  // Add lead form
  const addForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      sex: "", // Added sex field with empty default
      dateOfBirth: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      height: "",
      weight: "",
      smokerStatus: "No",
      medicalConditions: "",
      familyHistory: "",
      incomeRange: "",
      existingCoverage: "",
      coverageNeeds: "",
      insuranceTypeInterest: "",
      leadSource: "Website",
      assignedAgentId: null,
      status: "Leads",
      notes: "",
    },
  });

  // Add lead mutation
  const addLeadMutation = useMutation({
    mutationFn: async (newLead: LeadFormValues) => {
      console.log("Starting lead creation with data:", newLead);
      
      try {
        // Use fetch directly to have more control over the response handling
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newLead),
          credentials: "include",
        });
        
        console.log("Lead creation API response status:", response.status, response.statusText);
        
        if (!response.ok) {
          let errorMessage = "Failed to add lead";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `${errorMessage}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        // Parse the successful response
        const responseData = await response.json();
        console.log("Lead created successfully:", responseData);
        return responseData;
      } catch (error) {
        console.error("Lead creation exception:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Successfully created a lead
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      
      toast({
        title: "Lead added",
        description: `New lead "${data.lead.firstName} ${data.lead.lastName}" has been successfully added`,
      });
      
      // Reset the form and close the dialog
      addForm.reset();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error("Lead add error:", error);
      
      // Improved error message that shows the actual error
      let errorMessage = "Failed to add lead: undefined";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        console.error("Full error details:", error);
      }
      
      toast({
        title: "Error Adding Lead",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LeadFormValues }) => {
      try {
        // Use PATCH instead of PUT for better compatibility
        return await fetch(`/api/leads/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        });
      } catch (error) {
        console.error("Network error during lead update:", error);
        throw new Error("Network error occurred. Please try again.");
      }
    },
    onSuccess: async (response) => {
      if (!response.ok) {
        // Handle HTTP error responses (like 400, 401, 403, 500, etc.)
        const errorText = await response.text();
        let errorMessage = "Failed to update lead";
        
        try {
          // Try to parse the error message from the response
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If the error response is not valid JSON, use the status text
          errorMessage = `${errorMessage}: ${response.statusText || "Unknown error"}`;
        }
        
        console.error("Lead update HTTP error:", response.status, errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      // Success case
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead updated",
        description: "Lead has been successfully updated",
      });
      setIsEditDialogOpen(false);
      setSelectedLead(null);
    },
    onError: (error: Error) => {
      console.error("Lead update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update lead",
        variant: "destructive",
      });
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/leads/${id}`);
      if (!response.ok) {
        // Try to extract the error message from the response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete lead');
        } catch (parseError) {
          throw new Error(`Failed to delete lead: ${response.statusText}`);
        }
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead deleted",
        description: "Lead has been successfully deleted",
      });
    },
    onError: (error: Error) => {
      console.error("Lead delete error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete lead",
        variant: "destructive",
      });
    },
  });

  // Add lead form
  const addForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      sex: "", // Added sex field with empty default
      dateOfBirth: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      height: "",
      weight: "",
      smokerStatus: "No",
      medicalConditions: "",
      familyHistory: "",
      incomeRange: "",
      existingCoverage: "",
      coverageNeeds: "",
      insuranceTypeInterest: "",
      leadSource: "Website",
      assignedAgentId: null,
      status: "Leads",
      notes: "",
    },
  });

  // Edit lead form
  const editForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
  });

  // Format date from ISO string to YYYY-MM-DD
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0];
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // If birthday hasn't occurred this year yet, subtract 1 from age
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Extract state from address
  const extractState = (address: string): string => {
    // Attempt to find a state code in the address (assuming format: City, STATE ZIP)
    const stateMatch = address.match(/,\s*([A-Z]{2})\s*\d{5}(?:-\d{4})?$/i);
    if (stateMatch && stateMatch[1]) {
      return stateMatch[1].toUpperCase();
    }
    
    // If standard format isn't found, look for any two uppercase letters that might be a state
    const altStateMatch = address.match(/\b([A-Z]{2})\b/);
    if (altStateMatch && altStateMatch[1]) {
      return altStateMatch[1];
    }
    
    return "N/A"; // Return N/A if no state found
  };

  // Set up edit form when a lead is selected
  React.useEffect(() => {
    if (selectedLead && isEditDialogOpen) {
      // Check if address contains multiple lines to split into address line 1 and 2
      let addressLine1 = "";
      let addressLine2 = "";
      
      if (selectedLead.address) {
        const addressParts = selectedLead.address.split('\n');
        addressLine1 = addressParts[0] || "";
        addressLine2 = addressParts.length > 1 ? addressParts.slice(1).join('\n') : "";
      }
      
      editForm.reset({
        firstName: selectedLead.firstName,
        lastName: selectedLead.lastName,
        sex: selectedLead.sex || "", // Added sex field
        dateOfBirth: formatDate(selectedLead.dateOfBirth),
        email: selectedLead.email,
        phoneNumber: selectedLead.phoneNumber,
        address: addressLine1,
        addressLine2: addressLine2, // Added address line 2
        city: selectedLead.city || "",
        state: selectedLead.state || "",
        zipCode: selectedLead.zipCode || "",
        height: selectedLead.height || "",
        weight: selectedLead.weight || "",
        smokerStatus: selectedLead.smokerStatus,
        medicalConditions: selectedLead.medicalConditions || "",
        familyHistory: selectedLead.familyHistory || "",
        incomeRange: selectedLead.incomeRange || "",
        existingCoverage: selectedLead.existingCoverage || "",
        coverageNeeds: selectedLead.coverageNeeds || "",
        insuranceTypeInterest: selectedLead.insuranceTypeInterest || "",
        leadSource: selectedLead.leadSource,
        assignedAgentId: selectedLead.assignedAgentId,
        status: selectedLead.status,
        notes: selectedLead.notes || "",
      });
    }
  }, [selectedLead, editForm, isEditDialogOpen]);

  // Handle add form submission with improved error handling
  const onAddSubmit = (data: LeadFormValues) => {
    // Validate required fields that might cause backend issues
    if (!data.email || !data.phoneNumber || !data.state) {
      const missingFields = [];
      if (!data.email) missingFields.push("Email");
      if (!data.phoneNumber) missingFields.push("Phone Number");
      if (!data.state) missingFields.push("State");
      
      toast({
        title: "Missing Required Fields",
        description: `Please fill in the following required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    // Log the data being submitted for debugging
    console.log("Submitting lead data:", data);
    
    // Proceed with the mutation
    addLeadMutation.mutate(data);
  };

  // Handle edit form submission
  const onEditSubmit = (data: LeadFormValues) => {
    if (selectedLead) {
      updateLeadMutation.mutate({
        id: selectedLead.id,
        data,
      });
    }
  };

  // Handle delete lead
  const handleDelete = (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete ${lead.firstName} ${lead.lastName}?`)) {
      deleteLeadMutation.mutate(lead.id);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      new: { variant: "outline", icon: <Clock size={14} className="mr-1" />, label: "New" },
      Leads: { variant: "outline", icon: <Clock size={14} className="mr-1" />, label: "Leads" },
      contacted: { variant: "secondary", icon: <Clock size={14} className="mr-1" />, label: "Contacted" },
      qualified: { variant: "default", icon: <Check size={14} className="mr-1" />, label: "Qualified" },
      unqualified: { variant: "destructive", icon: <X size={14} className="mr-1" />, label: "Unqualified" },
      converted: { variant: "success", icon: <Check size={14} className="mr-1" />, label: "Converted" },
      lost: { variant: "outline", icon: <X size={14} className="mr-1" />, label: "Lost" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Leads;

    return (
      <Badge variant={config.variant as any} className="flex items-center">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const isLoading = leadsLoading || agentsLoading;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Insurance Leads</h1>
        <Dialog 
          open={isAddDialogOpen} 
          onOpenChange={(open) => {
            // Reset form to default blank values when opening the dialog
            if (open) {
              addForm.reset({
                firstName: "",
                lastName: "",
                sex: "",
                dateOfBirth: "",
                email: "",
                phoneNumber: "",
                address: "",
                addressLine2: "", // Added address line 2 field
                city: "",
                state: "",
                zipCode: "",
                height: "",
                weight: "",
                smokerStatus: "No",
                medicalConditions: "",
                familyHistory: "",
                incomeRange: "",
                existingCoverage: "",
                coverageNeeds: "",
                insuranceTypeInterest: "",
                leadSource: "Website",
                assignedAgentId: null,
                status: "Leads",
                notes: "",
              });
            }
            setIsAddDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              <span>Add Lead</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new insurance lead.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput 
                            placeholder="123-456-7890"
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={field.disabled}
                          />
                        </FormControl>
                        <FormDescription>
                          Number will be automatically formatted with dashes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="m">Male</SelectItem>
                            <SelectItem value="f">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Apt, Suite, Unit, etc. (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Los Angeles" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AL">Alabama</SelectItem>
                            <SelectItem value="AK">Alaska</SelectItem>
                            <SelectItem value="AZ">Arizona</SelectItem>
                            <SelectItem value="AR">Arkansas</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="CO">Colorado</SelectItem>
                            <SelectItem value="CT">Connecticut</SelectItem>
                            <SelectItem value="DE">Delaware</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="GA">Georgia</SelectItem>
                            <SelectItem value="HI">Hawaii</SelectItem>
                            <SelectItem value="ID">Idaho</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                            <SelectItem value="IN">Indiana</SelectItem>
                            <SelectItem value="IA">Iowa</SelectItem>
                            <SelectItem value="KS">Kansas</SelectItem>
                            <SelectItem value="KY">Kentucky</SelectItem>
                            <SelectItem value="LA">Louisiana</SelectItem>
                            <SelectItem value="ME">Maine</SelectItem>
                            <SelectItem value="MD">Maryland</SelectItem>
                            <SelectItem value="MA">Massachusetts</SelectItem>
                            <SelectItem value="MI">Michigan</SelectItem>
                            <SelectItem value="MN">Minnesota</SelectItem>
                            <SelectItem value="MS">Mississippi</SelectItem>
                            <SelectItem value="MO">Missouri</SelectItem>
                            <SelectItem value="MT">Montana</SelectItem>
                            <SelectItem value="NE">Nebraska</SelectItem>
                            <SelectItem value="NV">Nevada</SelectItem>
                            <SelectItem value="NH">New Hampshire</SelectItem>
                            <SelectItem value="NJ">New Jersey</SelectItem>
                            <SelectItem value="NM">New Mexico</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="NC">North Carolina</SelectItem>
                            <SelectItem value="ND">North Dakota</SelectItem>
                            <SelectItem value="OH">Ohio</SelectItem>
                            <SelectItem value="OK">Oklahoma</SelectItem>
                            <SelectItem value="OR">Oregon</SelectItem>
                            <SelectItem value="PA">Pennsylvania</SelectItem>
                            <SelectItem value="RI">Rhode Island</SelectItem>
                            <SelectItem value="SC">South Carolina</SelectItem>
                            <SelectItem value="SD">South Dakota</SelectItem>
                            <SelectItem value="TN">Tennessee</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="UT">Utah</SelectItem>
                            <SelectItem value="VT">Vermont</SelectItem>
                            <SelectItem value="VA">Virginia</SelectItem>
                            <SelectItem value="WA">Washington</SelectItem>
                            <SelectItem value="WV">West Virginia</SelectItem>
                            <SelectItem value="WI">Wisconsin</SelectItem>
                            <SelectItem value="WY">Wyoming</SelectItem>
                            <SelectItem value="DC">District of Columbia</SelectItem>
                            <SelectItem value="PR">Puerto Rico</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="90210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addForm.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height</FormLabel>
                        <FormControl>
                          <Input placeholder="5'10&quot;" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input placeholder="170 lbs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="smokerStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Smoker Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select smoker status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="Former">Former</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Medical Conditions</FormLabel>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {["Heart Disease", "Diabetes", "Cancer", "High Blood Pressure", "High Cholesterol", "Hepatitis"].map((condition) => (
                              <label key={condition} className="flex items-center space-x-2 border rounded px-3 py-1 cursor-pointer hover:bg-accent">
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(condition)}
                                  onChange={(e) => {
                                    const currentValue = field.value || "";
                                    const conditions = currentValue ? currentValue.split(", ").filter(c => c.trim() !== "") : [];
                                    
                                    if (e.target.checked) {
                                      if (!conditions.includes(condition)) {
                                        conditions.push(condition);
                                      }
                                    } else {
                                      const index = conditions.indexOf(condition);
                                      if (index !== -1) {
                                        conditions.splice(index, 1);
                                      }
                                    }
                                    
                                    field.onChange(conditions.join(", "));
                                  }}
                                  className="h-4 w-4"
                                />
                                <span>{condition}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <span>Other:</span>
                              <Input 
                                placeholder="Additional conditions" 
                                value={field.value?.split(", ").filter(c => 
                                  !["Heart Disease", "Diabetes", "Cancer", "High Blood Pressure", "High Cholesterol", "Hepatitis"].includes(c)
                                ).join(", ") || ""}
                                onChange={(e) => {
                                  const currentValue = field.value || "";
                                  const conditions = currentValue ? currentValue.split(", ").filter(c => 
                                    ["Heart Disease", "Diabetes", "Cancer", "High Blood Pressure", "High Cholesterol", "Hepatitis"].includes(c)
                                  ) : [];
                                  
                                  if (e.target.value.trim() !== "") {
                                    conditions.push(e.target.value.trim());
                                  }
                                  
                                  field.onChange(conditions.join(", "));
                                }}
                                className="flex-1"
                              />
                            </label>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="familyHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family History</FormLabel>
                        <FormControl>
                          <Input placeholder="Family medical history" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="incomeRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Income Range</FormLabel>
                        <FormControl>
                          <Input placeholder="75k-100k" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="existingCoverage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Existing Coverage</FormLabel>
                        <FormControl>
                          <Input placeholder="Current insurance policies" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addForm.control}
                  name="coverageNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage Needs</FormLabel>
                      <FormControl>
                        <Input placeholder="500k term life, income protection" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="insuranceTypeInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Type Interest</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select insurance type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Term Life">Term Life</SelectItem>
                          <SelectItem value="Whole Life">Whole Life</SelectItem>
                          <SelectItem value="Final Expense">Final Expense</SelectItem>
                          <SelectItem value="IUL">Indexed Universal Life (IUL)</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addForm.control}
                    name="leadSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Source</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lead source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                            <SelectItem value="Cold Call">Cold Call</SelectItem>
                            <SelectItem value="TV">TV</SelectItem>
                            <SelectItem value="Radio">Radio</SelectItem>
                            <SelectItem value="ValPak Mailers">ValPak Mailers</SelectItem>
                            <SelectItem value="Bus">Bus</SelectItem>
                            <SelectItem value="Event">Event</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="unqualified">Unqualified</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addForm.control}
                  name="assignedAgentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Agent</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value !== "none" ? parseInt(value) : null)}
                        value={field.value ? field.value.toString() : "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select agent (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No agent assigned</SelectItem>
                          {agents?.map((agent: any) => (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              {agent.fullName || 
                               (agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : 
                                `Agent ${agent.id}`)}
                              {agent.licenseNumber ? ` (${agent.licenseNumber})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <div className="w-full flex flex-col space-y-2">
                    {/* Add error indicators at the form level */}
                    {Object.keys(addForm.formState.errors).length > 0 && (
                      <div className="text-sm text-red-500 p-2 bg-red-50 rounded mb-2">
                        <p><strong>Please fix the following errors:</strong></p>
                        <ul className="list-disc pl-5">
                          {Object.entries(addForm.formState.errors).map(([field, error]) => (
                            <li key={field}>{error?.message?.toString() || `Invalid ${field}`}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addLeadMutation.isPending}
                      >
                        {addLeadMutation.isPending ? "Saving..." : "Save Lead"}
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading leads...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
            <CardDescription>
              Manage potential insurance clients and their information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Date of Birth (Age)</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Lead Source</TableHead>
                    <TableHead>Assigned Agent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads && leads.length > 0 ? (
                    leads.map((lead: Lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </TableCell>
                        <TableCell>
                          {lead.sex ? (lead.sex === 'M' || lead.sex === 'm' ? 'Male' : 'Female') : 'Not specified'}
                        </TableCell>
                        <TableCell>
                          {lead.dateOfBirth ? (
                            <>
                              {new Date(lead.dateOfBirth).toLocaleDateString()} 
                              <span className="text-muted-foreground ml-2">
                                ({calculateAge(lead.dateOfBirth)} yrs)
                              </span>
                            </>
                          ) : (
                            'Not provided'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1 text-muted-foreground" />
                            {lead.state || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <UserPlus size={14} className="mr-1 text-muted-foreground" />
                            {lead.leadSource}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.assignedAgentId ? 
                            (() => {
                              const agent = agents?.find((a: any) => a.id === lead.assignedAgentId);
                              return agent ? 
                                (agent.fullName || 
                                 (agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : 
                                  `Agent ${lead.assignedAgentId}`)) : 
                                `Agent ${lead.assignedAgentId}`;
                            })()
                            : 
                            "Unassigned"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedLead(lead);
                                setIsEditDialogOpen(true);
                              }}
                              title="Edit lead"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedLead(lead);
                                setIsViewDialogOpen(true);
                              }}
                              title="View lead details"
                            >
                              <Eye size={16} />
                            </Button>

                            <a
                              href="https://rbrokers.com/quote-and-apply/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                              title="Create Quote"
                            >
                              <FileText size={16} />
                            </a>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(lead)}
                              title="Delete lead"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No leads found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Lead Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Detailed information about this lead.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="grid grid-cols-1 gap-6">
                {/* Personal Information */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-md font-semibold mb-3 text-primary">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-sm">{selectedLead.firstName} {selectedLead.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="text-sm">{selectedLead.sex || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p className="text-sm">
                        {selectedLead.dateOfBirth ? 
                          `${new Date(selectedLead.dateOfBirth).toLocaleDateString()} (Age: ${calculateAge(selectedLead.dateOfBirth)})` : 
                          'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-sm">{selectedLead.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-sm">{selectedLead.phoneNumber}</p>
                    </div>
                  </div>
                </div>
                
                {/* Address Information */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-md font-semibold mb-3 text-primary">Address</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Street Address</p>
                      <p className="text-sm">{selectedLead.address}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">City</p>
                        <p className="text-sm">{selectedLead.city}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">State</p>
                        <p className="text-sm">{selectedLead.state}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">ZIP Code</p>
                        <p className="text-sm">{selectedLead.zipCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Health Information */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-md font-semibold mb-3 text-primary">Health Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Height</p>
                      <p className="text-sm">{selectedLead.height || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Weight</p>
                      <p className="text-sm">{selectedLead.weight || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Smoker Status</p>
                      <p className="text-sm">{selectedLead.smokerStatus}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Medical Conditions</p>
                      <p className="text-sm">{selectedLead.medicalConditions || "None"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Family History</p>
                      <p className="text-sm">{selectedLead.familyHistory || "None provided"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Insurance Information */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-md font-semibold mb-3 text-primary">Insurance Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-1">
                        <StatusBadge status={selectedLead.status} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Lead Source</p>
                      <p className="text-sm">{selectedLead.leadSource}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Income Range</p>
                      <p className="text-sm">{selectedLead.incomeRange || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Insurance Type Interest</p>
                      <p className="text-sm">{selectedLead.insuranceTypeInterest}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Existing Coverage</p>
                      <p className="text-sm">{selectedLead.existingCoverage || "None"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Coverage Needs</p>
                      <p className="text-sm">{selectedLead.coverageNeeds || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assigned Agent</p>
                      <p className="text-sm">
                        {selectedLead.assignedAgentId ? 
                          (() => {
                            const agent = agents?.find((a: any) => a.id === selectedLead.assignedAgentId);
                            return agent ? 
                              (agent.fullName || 
                               (agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : 
                                `Agent ${selectedLead.assignedAgentId}`)) : 
                              `Agent ${selectedLead.assignedAgentId}`;
                          })()
                          : 
                          "Unassigned"
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                {selectedLead.notes && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-md font-semibold mb-3 text-primary">Notes</h3>
                    <p className="text-sm whitespace-pre-wrap">{selectedLead.notes}</p>
                  </div>
                )}
            </div>
          )}
          
          <DialogFooter className="flex justify-end gap-2 mt-4 border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsViewDialogOpen(false);
                setIsEditDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Lead
            </Button>
            <a 
              href="https://rbrokers.com/quote-and-apply/"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Quote
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update lead information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Same form fields as add form */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Remaining fields similar to add form */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput 
                          placeholder="123-456-7890"
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={field.disabled}
                        />
                      </FormControl>
                      <FormDescription>
                        Number will be automatically formatted with dashes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sex</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="m">Male</SelectItem>
                          <SelectItem value="f">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AL">Alabama</SelectItem>
                          <SelectItem value="AK">Alaska</SelectItem>
                          <SelectItem value="AZ">Arizona</SelectItem>
                          <SelectItem value="AR">Arkansas</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="CO">Colorado</SelectItem>
                          <SelectItem value="CT">Connecticut</SelectItem>
                          <SelectItem value="DE">Delaware</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="GA">Georgia</SelectItem>
                          <SelectItem value="HI">Hawaii</SelectItem>
                          <SelectItem value="ID">Idaho</SelectItem>
                          <SelectItem value="IL">Illinois</SelectItem>
                          <SelectItem value="IN">Indiana</SelectItem>
                          <SelectItem value="IA">Iowa</SelectItem>
                          <SelectItem value="KS">Kansas</SelectItem>
                          <SelectItem value="KY">Kentucky</SelectItem>
                          <SelectItem value="LA">Louisiana</SelectItem>
                          <SelectItem value="ME">Maine</SelectItem>
                          <SelectItem value="MD">Maryland</SelectItem>
                          <SelectItem value="MA">Massachusetts</SelectItem>
                          <SelectItem value="MI">Michigan</SelectItem>
                          <SelectItem value="MN">Minnesota</SelectItem>
                          <SelectItem value="MS">Mississippi</SelectItem>
                          <SelectItem value="MO">Missouri</SelectItem>
                          <SelectItem value="MT">Montana</SelectItem>
                          <SelectItem value="NE">Nebraska</SelectItem>
                          <SelectItem value="NV">Nevada</SelectItem>
                          <SelectItem value="NH">New Hampshire</SelectItem>
                          <SelectItem value="NJ">New Jersey</SelectItem>
                          <SelectItem value="NM">New Mexico</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="NC">North Carolina</SelectItem>
                          <SelectItem value="ND">North Dakota</SelectItem>
                          <SelectItem value="OH">Ohio</SelectItem>
                          <SelectItem value="OK">Oklahoma</SelectItem>
                          <SelectItem value="OR">Oregon</SelectItem>
                          <SelectItem value="PA">Pennsylvania</SelectItem>
                          <SelectItem value="RI">Rhode Island</SelectItem>
                          <SelectItem value="SC">South Carolina</SelectItem>
                          <SelectItem value="SD">South Dakota</SelectItem>
                          <SelectItem value="TN">Tennessee</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="UT">Utah</SelectItem>
                          <SelectItem value="VT">Vermont</SelectItem>
                          <SelectItem value="VA">Virginia</SelectItem>
                          <SelectItem value="WA">Washington</SelectItem>
                          <SelectItem value="WV">West Virginia</SelectItem>
                          <SelectItem value="WI">Wisconsin</SelectItem>
                          <SelectItem value="WY">Wyoming</SelectItem>
                          <SelectItem value="DC">District of Columbia</SelectItem>
                          <SelectItem value="PR">Puerto Rico</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="smokerStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smoker Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select smoker status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="Former">Former</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="medicalConditions"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Medical Conditions</FormLabel>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {["Heart Disease", "Diabetes", "Cancer", "High Blood Pressure", "High Cholesterol", "Hepatitis"].map((condition) => (
                            <label key={condition} className="flex items-center space-x-2 border rounded px-3 py-1 cursor-pointer hover:bg-accent">
                              <input
                                type="checkbox"
                                checked={field.value?.includes(condition)}
                                onChange={(e) => {
                                  const currentValue = field.value || "";
                                  const conditions = currentValue ? currentValue.split(", ").filter(c => c.trim() !== "") : [];
                                  
                                  if (e.target.checked) {
                                    if (!conditions.includes(condition)) {
                                      conditions.push(condition);
                                    }
                                  } else {
                                    const index = conditions.indexOf(condition);
                                    if (index !== -1) {
                                      conditions.splice(index, 1);
                                    }
                                  }
                                  
                                  field.onChange(conditions.join(", "));
                                }}
                                className="h-4 w-4"
                              />
                              <span>{condition}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2">
                            <span>Other:</span>
                            <Input 
                              placeholder="Additional conditions" 
                              value={field.value?.split(", ").filter(c => 
                                !["Heart Disease", "Diabetes", "Cancer", "High Blood Pressure", "High Cholesterol", "Hepatitis"].includes(c)
                              ).join(", ") || ""}
                              onChange={(e) => {
                                const currentValue = field.value || "";
                                const conditions = currentValue ? currentValue.split(", ").filter(c => 
                                  ["Heart Disease", "Diabetes", "Cancer", "High Blood Pressure", "High Cholesterol", "Hepatitis"].includes(c)
                                ) : [];
                                
                                if (e.target.value.trim() !== "") {
                                  conditions.push(e.target.value.trim());
                                }
                                
                                field.onChange(conditions.join(", "));
                              }}
                              className="flex-1"
                            />
                          </label>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="familyHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family History</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="insuranceTypeInterest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Type Interest</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select insurance type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Term Life">Term Life</SelectItem>
                        <SelectItem value="Whole Life">Whole Life</SelectItem>
                        <SelectItem value="Final Expense">Final Expense</SelectItem>
                        <SelectItem value="IUL">Indexed Universal Life (IUL)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="leadSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lead source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                          <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                          <SelectItem value="Cold Call">Cold Call</SelectItem>
                          <SelectItem value="TV">TV</SelectItem>
                          <SelectItem value="Radio">Radio</SelectItem>
                          <SelectItem value="ValPak Mailers">ValPak Mailers</SelectItem>
                          <SelectItem value="Bus">Bus</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="unqualified">Unqualified</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="assignedAgentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Agent</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No agent assigned</SelectItem>
                        {agents?.map((agent: any) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.fullName || 
                             (agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : 
                              `Agent ${agent.id}`)}
                            {agent.licenseNumber ? ` (${agent.licenseNumber})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedLead(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateLeadMutation.isPending}
                >
                  {updateLeadMutation.isPending ? "Saving..." : "Update Lead"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsPage;