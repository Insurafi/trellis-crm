import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";

// Define the form schema for editing agents
const agentFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  licenseNumber: z.string().optional(),
  licenseExpiration: z.string().optional(),
  npn: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  carrierAppointments: z.string().optional(),
  uplineAgentId: z.number().nullable().optional(),
  commissionPercentage: z.string().optional(),
  overridePercentage: z.string().optional(),
  specialties: z.string().optional(),
  notes: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const AgentEditPage = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [matched, params] = useRoute<{ id: string }>("/agent-edit/:id");
  
  // Initialize form with validation
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      licenseNumber: "",
      licenseExpiration: "",
      npn: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      carrierAppointments: "",
      uplineAgentId: null,
      commissionPercentage: "0.00",
      overridePercentage: "0.00",
      specialties: "",
      notes: "",
    }
  });

  // Fetch agent data if ID is provided
  const agentId = matched ? parseInt(params.id) : null;
  
  const { data: agent, isLoading } = useQuery({
    queryKey: [`/api/agent-data/${agentId}`],
    enabled: !!agentId,
  });
  
  // Format date from ISO string to YYYY-MM-DD
  const formatDate = (isoDate: string | null | undefined) => {
    if (!isoDate) return ""; 
    
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Update form when agent data is loaded
  useEffect(() => {
    if (agent) {
      console.log("Setting form values with agent data:", agent);
      
      // Try to get the name from fullName or name field
      let firstName = "";
      let lastName = "";
      
      // Check for name in various properties
      if (agent.fullName) {
        const nameParts = agent.fullName.split(" ");
        firstName = nameParts[0] || "";
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      } else if (agent.name) {
        const nameParts = agent.name.split(" ");
        firstName = nameParts[0] || "";
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      }
      
      // Reset form with agent data
      reset({
        firstName,
        lastName,
        licenseNumber: agent.licenseNumber || "",
        licenseExpiration: formatDate(agent.licenseExpiration),
        npn: agent.npn || "",
        phoneNumber: agent.phoneNumber || "",
        address: agent.address || "",
        city: agent.city || "",
        state: agent.state || "",
        zipCode: agent.zipCode || "",
        carrierAppointments: agent.carrierAppointments || "",
        uplineAgentId: agent.uplineAgentId || null,
        commissionPercentage: agent.commissionPercentage || "0.00",
        overridePercentage: agent.overridePercentage || "0.00",
        specialties: agent.specialties || "",
        notes: agent.notes || "",
      });
      
      console.log("Form reset completed with values from agent");
    }
  }, [agent, reset]);

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async (data: AgentFormValues) => {
      console.log("⚠️ AGENT UPDATE STARTED ⚠️");
      console.log("Updating agent ID:", agentId);
      console.log("Full form data:", JSON.stringify(data, null, 2));
      
      // Validation for name fields
      if (!data.firstName || !data.lastName) {
        console.error("Missing firstName or lastName in agent update data");
        throw new Error("First name and last name are required");
      }
      
      return apiRequest("PATCH", `/api/agents/${agentId}`, data);
    },
    onSuccess: () => {
      console.log("Successfully updated agent!");
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["/api/agents"],
        type: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/agent-data'],
        type: 'all',
      });
      
      toast({
        title: "Success",
        description: "Agent has been updated successfully.",
      });
      
      // Navigate back to agents page
      setLocation("/agents");
    },
    onError: (error) => {
      console.error("Error updating agent:", error);
      toast({
        title: "Error",
        description: "Failed to update agent: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: AgentFormValues) => {
    updateAgentMutation.mutate(data);
  };

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading agent data...</p>
        </div>
      </div>
    );
  }

  // If no agent found with the ID
  if (!isLoading && !agent && agentId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
          <h2 className="text-xl font-bold">Error</h2>
          <p>No agent found with ID: {agentId}</p>
        </div>
        <Button onClick={() => setLocation("/agents")}>
          Return to Agents
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Agent</h1>
        <Button variant="outline" onClick={() => setLocation("/agents")}>
          Cancel
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Smith"
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* License Information */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800">License Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                    License Number
                  </label>
                  <input
                    id="licenseNumber"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register("licenseNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="licenseExpiration" className="block text-sm font-medium text-gray-700">
                    License Expiration
                  </label>
                  <input
                    id="licenseExpiration"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register("licenseExpiration")}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="npn" className="block text-sm font-medium text-gray-700">
                    NPN
                  </label>
                  <input
                    id="npn"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register("npn")}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register("phoneNumber")}
                  />
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800">Address Information</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register("address")}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      {...register("city")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      {...register("state")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      {...register("zipCode")}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business Information */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="carrierAppointments" className="block text-sm font-medium text-gray-700">
                    Carrier Appointments
                  </label>
                  <input
                    id="carrierAppointments"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register("carrierAppointments")}
                  />
                  <p className="text-xs text-gray-500">Separate multiple carriers with commas</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="specialties" className="block text-sm font-medium text-gray-700">
                    Specialties
                  </label>
                  <input
                    id="specialties"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register("specialties")}
                  />
                  <p className="text-xs text-gray-500">Separate multiple specialties with commas</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="commissionPercentage" className="block text-sm font-medium text-gray-700">
                    Commission Percentage
                  </label>
                  <input
                    id="commissionPercentage"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register("commissionPercentage")}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="overridePercentage" className="block text-sm font-medium text-gray-700">
                    Override Percentage
                  </label>
                  <input
                    id="overridePercentage"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...register("overridePercentage")}
                  />
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800">Additional Information</h2>
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-32"
                  {...register("notes")}
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/agents")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateAgentMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {updateAgentMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentEditPage;