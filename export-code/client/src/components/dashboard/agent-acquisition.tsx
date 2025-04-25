import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { UserPlus, ArrowUpRight, ArrowUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Client } from "@shared/schema";

interface ClientWithAgentInfo extends Client {
  agentName?: string | null;
  agentId?: number | null;
  isNewClient?: boolean;
}

// This component will display new clients acquired by each agent
export default function AgentAcquisition() {
  // Fetch clients data
  const { data: clients = [], isLoading: clientsLoading } = useQuery<ClientWithAgentInfo[]>({
    queryKey: ['/api/clients'],
  });
  
  // Fetch agents data
  const { data: agents = [], isLoading: agentsLoading } = useQuery<any[]>({
    queryKey: ['/api/agents'],
  });

  // Calculate the 30-day window for "new" clients
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Calculate client acquisition statistics by agent
  const agentAcquisitions = agents.map(agent => {
    // Count new clients for this agent acquired in the last 30 days
    const newClientsCount = clients.filter(client => {
      // Safely handle null dates
      if (!client.createdAt) return false;
      
      const clientCreatedDate = new Date(client.createdAt);
      return (
        client.assignedAgentId === agent.id && 
        clientCreatedDate > thirtyDaysAgo
      );
    }).length;
    
    // Get all clients for this agent (for total count)
    const totalClientsCount = clients.filter(client => 
      client.assignedAgentId === agent.id
    ).length;
    
    return {
      id: agent.id,
      name: agent.fullName || agent.name,
      newClientsCount,
      totalClientsCount,
    };
  });
  
  // Sort by most new clients first
  const sortedAgentAcquisitions = [...agentAcquisitions].sort((a, b) => 
    b.newClientsCount - a.newClientsCount
  );
  
  // Get total new clients across all agents
  const totalNewClients = clients.filter(client => {
    // Safely handle null dates
    if (!client.createdAt) return false;
    
    const clientCreatedDate = new Date(client.createdAt);
    return clientCreatedDate > thirtyDaysAgo;
  }).length;

  const isLoading = clientsLoading || agentsLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Client Acquisition</CardTitle>
            <CardDescription>New clients in the last 30 days</CardDescription>
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <UserPlus className="h-4 w-4 mr-1.5" />
            {isLoading ? (
              <Skeleton className="h-5 w-12" />
            ) : (
              <>{totalNewClients} Total</>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="ml-3 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-12 rounded-md" />
              </div>
            ))}
          </div>
        ) : sortedAgentAcquisitions.length > 0 ? (
          <div className="space-y-3">
            {sortedAgentAcquisitions
              .filter(agent => agent.totalClientsCount > 0)
              .slice(0, 5)
              .map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {agent.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-xs text-neutral-500">
                        {agent.totalClientsCount} total client{agent.totalClientsCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full ${
                    agent.newClientsCount > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {agent.newClientsCount > 0 ? (
                      <>
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        <span className="font-medium">{agent.newClientsCount} new</span>
                      </>
                    ) : (
                      <span>No new</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <UserPlus className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
            <h3 className="font-medium mb-1">No Client Acquisition</h3>
            <p className="text-sm text-neutral-500">No agents have acquired clients yet.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center border-t pt-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/agents">
            View All Agents
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}