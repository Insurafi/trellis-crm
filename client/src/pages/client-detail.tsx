import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  ChevronLeft,
  Loader2,
  Save,
  Trash,
  CalendarClock,
  File,
  Briefcase,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ClientDetail() {
  const { id } = useParams();
  const clientId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  
  // Fetch client details
  const {
    data: client,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !isNaN(clientId)
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    avatarUrl: "",
    notes: ""
  });

  // Update form when client data is loaded
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
        address: client.address || "",
        city: client.city || "",
        state: client.state || "",
        zipCode: client.zipCode || "",
        avatarUrl: client.avatarUrl || "",
        notes: client.notes || ""
      });
    }
  }, [client]);

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('PATCH', `/api/clients/${clientId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client information updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update client information. Please try again.",
      });
    }
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/clients/${clientId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      navigate('/clients');
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete client. Please try again.",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClientMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      deleteClientMutation.mutate();
    }
  };

  // Fetch client documents
  const { data: documents = [] } = useQuery({
    queryKey: [`/api/documents?clientId=${clientId}`],
    enabled: !isNaN(clientId)
  });

  // Fetch client policies
  const { data: policies = [] } = useQuery({
    queryKey: [`/api/policies?clientId=${clientId}`],
    enabled: !isNaN(clientId)
  });

  // Fetch client tasks
  const { data: tasks = [] } = useQuery({
    queryKey: [`/api/tasks?clientId=${clientId}`],
    enabled: !isNaN(clientId)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading client details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
        <div className="text-center py-10">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900">Error Loading Client</h2>
          <p className="text-neutral-600 mt-2">Failed to load client details. Please try again later.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/clients')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
        <div className="text-center py-10">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900">Client Not Found</h2>
          <p className="text-neutral-600 mt-2">The requested client could not be found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/clients')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/clients')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Client Details</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteClientMutation.isPending}>
          {deleteClientMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash className="h-4 w-4 mr-2" />
              Delete Client
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Client Info Card */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Client Profile</CardTitle>
              <CardDescription>Client information and contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 mb-4">
                  <img 
                    src={client.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`}
                    alt={`${client.name} avatar`} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold">{client.name}</h2>
                {client.assignedAgentId && (
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                    Assigned to: Agent #{client.assignedAgentId}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm">{client.email || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm">{client.phone || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Building className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company</p>
                    <p className="text-sm">{client.company || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm">
                      {client.address ? (
                        <>
                          {client.address}
                          {(client.city || client.state || client.zipCode) && <br />}
                          {[
                            client.city, 
                            client.state, 
                            client.zipCode
                          ].filter(Boolean).join(", ")}
                        </>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">
                <User className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="documents">
                <File className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="policies">
                <Briefcase className="h-4 w-4 mr-2" />
                Policies
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <Clock className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Client Information</CardTitle>
                  <CardDescription>Update client details and contact information</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleInputChange}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium">Company</label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company || ""}
                          onChange={handleInputChange}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium">Address</label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="city" className="text-sm font-medium">City</label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city || ""}
                          onChange={handleInputChange}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="state" className="text-sm font-medium">State</label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state || ""}
                          onChange={handleInputChange}
                          placeholder="State"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="zipCode" className="text-sm font-medium">Zip Code</label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode || ""}
                          onChange={handleInputChange}
                          placeholder="Zip code"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="avatarUrl" className="text-sm font-medium">Avatar URL</label>
                      <Input
                        id="avatarUrl"
                        name="avatarUrl"
                        value={formData.avatarUrl || ""}
                        onChange={handleInputChange}
                        placeholder="URL to client's avatar image"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes || ""}
                        onChange={handleInputChange}
                        placeholder="Additional notes about this client"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateClientMutation.isPending}
                    >
                      {updateClientMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Documents associated with this client</CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <div className="space-y-2">
                      {documents.map((doc: any) => (
                        <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <File className="h-5 w-5 mr-3 text-blue-500" />
                            <div>
                              <p className="font-medium">{doc.title || "Untitled Document"}</p>
                              <p className="text-sm text-gray-500">{doc.fileType || "Unknown type"} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <File className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">No Documents</h3>
                      <p className="text-gray-500 mt-1">This client doesn't have any documents yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Policies Tab */}
            <TabsContent value="policies">
              <Card>
                <CardHeader>
                  <CardTitle>Insurance Policies</CardTitle>
                  <CardDescription>Active and pending policies for this client</CardDescription>
                </CardHeader>
                <CardContent>
                  {policies.length > 0 ? (
                    <div className="space-y-3">
                      {policies.map((policy: any) => (
                        <div key={policy.id} className="rounded-md border p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{policy.policyType}</h4>
                              <p className="text-sm text-gray-500">Policy #{policy.policyNumber}</p>
                            </div>
                            <div className={`text-sm px-2.5 py-0.5 rounded-full ${policy.status === 'active' ? 'bg-green-100 text-green-800' : policy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                              {policy.status?.charAt(0).toUpperCase() + policy.status?.slice(1)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                            <div>
                              <span className="text-gray-500">Carrier:</span> {policy.carrier || "N/A"}
                            </div>
                            <div>
                              <span className="text-gray-500">Premium:</span> ${policy.premium || "0"}/{policy.premiumFrequency || "month"}
                            </div>
                            <div>
                              <span className="text-gray-500">Face Amount:</span> ${policy.faceAmount?.toLocaleString() || "0"}
                            </div>
                            <div>
                              <span className="text-gray-500">Issue Date:</span> {policy.issueDate ? new Date(policy.issueDate).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">No Policies</h3>
                      <p className="text-gray-500 mt-1">This client doesn't have any policies yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>Tasks related to this client</CardDescription>
                </CardHeader>
                <CardContent>
                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.map((task: any) => (
                        <div key={task.id} className="flex items-start space-x-3 p-3 rounded-md bg-gray-50">
                          <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <CalendarClock className="h-3.5 w-3.5 mr-1" />
                              <span>Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</span>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${task.status === 'completed' ? 'bg-green-100 text-green-800' : task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {task.status?.replace('_', ' ').charAt(0).toUpperCase() + task.status?.replace('_', ' ').slice(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">No Tasks</h3>
                      <p className="text-gray-500 mt-1">There are no tasks associated with this client yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}