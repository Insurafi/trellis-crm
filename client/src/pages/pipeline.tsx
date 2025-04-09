import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
} from "lucide-react";

interface PipelineStage {
  id: number;
  name: string;
  order: number;
  color: string;
  description: string | null;
  createdAt: string | null;
}

interface PipelineOpportunity {
  id: number;
  title: string;
  clientId: number | null;
  stageId: number;
  value: string;
  probability: number;
  expectedCloseDate: string | null;
  assignedTo: number | null;
  notes: string | null;
  status: string | null;
  createdAt: string | null;
  client?: {
    id: number;
    name: string;
  };
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
}

const Pipeline = () => {
  const { toast } = useToast();
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<PipelineOpportunity | null>(null);
  const [opportunityForm, setOpportunityForm] = useState({
    title: "",
    clientId: "",
    stageId: "",
    value: "",
    probability: "0",
    expectedCloseDate: "",
    notes: "",
  });

  // Fetch pipeline stages
  const { 
    data: stages = [],
    isLoading: stagesLoading,
    error: stagesError
  } = useQuery<PipelineStage[]>({
    queryKey: ["/api/pipeline/stages"],
  });

  // Fetch pipeline opportunities
  const { 
    data: opportunities = [],
    isLoading: opportunitiesLoading,
    error: opportunitiesError
  } = useQuery<PipelineOpportunity[]>({
    queryKey: ["/api/pipeline/opportunities", selectedStage],
    queryFn: async () => {
      const url = selectedStage 
        ? `/api/pipeline/opportunities?stageId=${selectedStage}` 
        : '/api/pipeline/opportunities';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      return response.json();
    },
  });
  
  // Fetch clients for select dropdown
  const { 
    data: clients = [],
    isLoading: clientsLoading
  } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const addOpportunityMutation = useMutation({
    mutationFn: async (newOpportunity: any) => {
      const response = await fetch('/api/pipeline/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOpportunity),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create opportunity');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pipeline/opportunities'] });
      resetOpportunityForm();
      setIsOpportunityDialogOpen(false);
      toast({
        title: "Success!",
        description: "New opportunity has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create opportunity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateOpportunityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/pipeline/opportunities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update opportunity');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pipeline/opportunities'] });
      resetOpportunityForm();
      setIsOpportunityDialogOpen(false);
      toast({
        title: "Success!",
        description: "Opportunity has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update opportunity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteOpportunityMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pipeline/opportunities/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete opportunity');
      }
      
      return response.status;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pipeline/opportunities'] });
      setSelectedOpportunity(null);
      toast({
        title: "Success!",
        description: "Opportunity has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete opportunity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetOpportunityForm = () => {
    setOpportunityForm({
      title: "",
      clientId: "",
      stageId: "",
      value: "",
      probability: "0",
      expectedCloseDate: "",
      notes: "",
    });
    setSelectedOpportunity(null);
  };

  const handleOpportunitySubmit = () => {
    const formData = {
      title: opportunityForm.title,
      clientId: opportunityForm.clientId ? parseInt(opportunityForm.clientId) : null,
      stageId: parseInt(opportunityForm.stageId),
      value: opportunityForm.value,
      probability: parseInt(opportunityForm.probability),
      expectedCloseDate: opportunityForm.expectedCloseDate 
        ? new Date(opportunityForm.expectedCloseDate).toISOString() 
        : null,
      notes: opportunityForm.notes || null,
      status: "active",
    };

    if (selectedOpportunity) {
      updateOpportunityMutation.mutate({ 
        id: selectedOpportunity.id, 
        data: formData 
      });
    } else {
      addOpportunityMutation.mutate(formData);
    }
  };

  const handleEditOpportunity = (opportunity: PipelineOpportunity) => {
    setSelectedOpportunity(opportunity);
    setOpportunityForm({
      title: opportunity.title,
      clientId: opportunity.clientId?.toString() || "",
      stageId: opportunity.stageId.toString(),
      value: opportunity.value,
      probability: opportunity.probability.toString(),
      expectedCloseDate: opportunity.expectedCloseDate || "",
      notes: opportunity.notes || "",
    });
    setIsOpportunityDialogOpen(true);
  };

  const handleDeleteOpportunity = (id: number) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      deleteOpportunityMutation.mutate(id);
    }
  };

  const handleFilterByStage = (stageId: string) => {
    setSelectedStage(stageId === "all" ? null : parseInt(stageId));
  };

  if (stagesLoading || opportunitiesLoading) {
    return <div className="p-8">Loading pipeline data...</div>;
  }

  if (stagesError || opportunitiesError) {
    return <div className="p-8 text-red-500">Error loading pipeline data</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Pipeline</h1>
        <div className="flex gap-4">
          <Select onValueChange={handleFilterByStage} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id.toString()}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isOpportunityDialogOpen} onOpenChange={setIsOpportunityDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetOpportunityForm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedOpportunity ? "Edit Opportunity" : "Add New Opportunity"}
                </DialogTitle>
                <DialogDescription>
                  {selectedOpportunity 
                    ? "Update the details for this sales opportunity" 
                    : "Enter the details for a new sales opportunity"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Opportunity Title</Label>
                  <Input
                    id="title"
                    value={opportunityForm.title}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, title: e.target.value })}
                    placeholder="e.g., Term Life Insurance Package"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="clientId">Client</Label>
                    <Select 
                      value={opportunityForm.clientId}
                      onValueChange={(value) => setOpportunityForm({ ...opportunityForm, clientId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stageId">Pipeline Stage</Label>
                    <Select 
                      value={opportunityForm.stageId}
                      onValueChange={(value) => setOpportunityForm({ ...opportunityForm, stageId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id.toString()}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="value">Value</Label>
                    <CurrencyInput
                      id="value"
                      value={opportunityForm.value}
                      onChange={(e) => setOpportunityForm({ ...opportunityForm, value: e.target.value })}
                      placeholder="250000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={opportunityForm.probability}
                      onChange={(e) => setOpportunityForm({ ...opportunityForm, probability: e.target.value })}
                      placeholder="50"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                  <Input
                    id="expectedCloseDate"
                    type="date"
                    value={opportunityForm.expectedCloseDate ? new Date(opportunityForm.expectedCloseDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, expectedCloseDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={opportunityForm.notes}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, notes: e.target.value })}
                    placeholder="Add any additional details about this opportunity"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpportunityDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleOpportunitySubmit} disabled={!opportunityForm.title || !opportunityForm.stageId}>
                  {selectedOpportunity ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pipeline Stages Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.filter(o => o.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${opportunities
                .filter(o => o.status === 'active')
                .reduce((sum, o) => sum + parseFloat(o.value.replace(/[^0-9.-]+/g,"")), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weighted Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${opportunities
                .filter(o => o.status === 'active')
                .reduce((sum, o) => {
                  const value = parseFloat(o.value.replace(/[^0-9.-]+/g,""));
                  return sum + (value * o.probability / 100);
                }, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    No opportunities found. Click 'New Opportunity' to create one.
                  </TableCell>
                </TableRow>
              ) : (
                opportunities.map((opportunity) => {
                  const stage = stages.find(s => s.id === opportunity.stageId);
                  return (
                    <TableRow key={opportunity.id}>
                      <TableCell className="font-medium">{opportunity.title}</TableCell>
                      <TableCell>
                        {clients.find(c => c.id === opportunity.clientId)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {stage && (
                          <Badge style={{ backgroundColor: stage.color }}>
                            {stage.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>${parseFloat(opportunity.value).toLocaleString()}</TableCell>
                      <TableCell>{opportunity.probability}%</TableCell>
                      <TableCell>
                        {opportunity.expectedCloseDate 
                          ? new Date(opportunity.expectedCloseDate).toLocaleDateString() 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {opportunity.status === 'won' && (
                          <Badge className="bg-green-100 text-green-800">Won</Badge>
                        )}
                        {opportunity.status === 'lost' && (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">Lost</Badge>
                        )}
                        {opportunity.status === 'active' && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOpportunity(opportunity)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDeleteOpportunity(opportunity.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pipeline;