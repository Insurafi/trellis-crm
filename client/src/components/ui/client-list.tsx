import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Eye, UserPlus, Clock, Award } from "lucide-react";
import { Client } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Enhanced client type with agent info
interface ClientWithAgentInfo extends Client {
  agentName?: string | null;
  agentInitials?: string | null;
  agentId?: number | null;
  isAgentOnline?: boolean;
  isNewClient?: boolean;
}

const ClientList = () => {
  const { data: clients = [], isLoading, error } = useQuery<ClientWithAgentInfo[]>({
    queryKey: ['/api/clients'],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time agent status
  });
  
  const { data: agents = [], isLoading: agentsLoading } = useQuery<any[]>({
    queryKey: ['/api/agents'],
    enabled: !isLoading && !!clients,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time online status
  });
  
  // Helper function to get agent initials from full name
  const getAgentInitials = (fullName: string): string => {
    if (!fullName) return "A";
    
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    // Get first and last name initials
    return (names[0].charAt(0) + (names[names.length - 1]?.charAt(0) || '')).toUpperCase();
  };
  
  // Helper function to manually assign agents to clients that don't have them
  // (This is only for demonstration purposes)
  const assignAgentsToClients = (clients: ClientWithAgentInfo[], agents: any[]) => {
    if (!agents || agents.length === 0) return clients;
    
    return clients.map((client, index) => {
      // If client already has assigned agent, keep that association
      if (client.assignedAgentId) {
        const agent = agents.find(a => a.id === client.assignedAgentId);
        const fullName = agent?.fullName || agent?.name || "Agent";
        return {
          ...client,
          agentName: fullName,
          agentInitials: getAgentInitials(fullName),
          isAgentOnline: agent?.isOnline || false
        };
      }
      
      // Otherwise, assign an agent (cycling through available agents)
      const agent = agents[index % agents.length];
      const fullName = agent?.fullName || agent?.name || "Agent";
      return {
        ...client,
        assignedAgentId: agent?.id,
        agentName: fullName,
        agentInitials: getAgentInitials(fullName),
        isAgentOnline: agent?.isOnline || false,
      };
    });
  };
  
  // Ensure each client has agent information
  const clientsWithAgents = assignAgentsToClients(clients, agents);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="py-3 flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-3 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div>Error loading clients</div>;
  }

  if (!clientsWithAgents || clientsWithAgents.length === 0) {
    return <div className="p-4 text-center text-neutral-500">No clients found</div>;
  }

  // Filter to show newest clients first (already sorted by backend)
  // Only show the first 5 clients to fit the dashboard card
  const recentClients = clientsWithAgents.slice(0, 5);

  return (
    <div className="px-6 py-2">
      <div className="divide-y divide-neutral-200">
        {recentClients.map((client) => (
          <div key={client.id} className="py-3 flex items-center">
            <img
              src={client.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`}
              alt={`${client.name} avatar`}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3 min-w-0 flex-1">
              <div className="flex items-center">
                {/* Agent badge with initials moved before client name */}
                <div className="relative mr-2">
                  <span 
                    className="inline-flex items-center justify-center h-6 w-6 rounded-full font-semibold bg-blue-100 text-blue-800 shadow-sm"
                    title={client.agentName || "Assigned Agent"} 
                  >
                    {'agentInitials' in client && client.agentInitials ? client.agentInitials : 
                     client.agentName ? client.agentName.charAt(0) : 'A'}
                  </span>
                  {client.isAgentOnline && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="text-sm font-medium text-neutral-900 truncate mr-2">{client.name}</div>
                {/* Don't show "New" tag for clients assigned to Aaron Barnes (agent ID 4) */}
                {client.isNewClient && client.agentId !== 4 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <Clock className="h-3 w-3 mr-1" />
                    New
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500 flex items-center gap-1">
                {client.email || client.phone || "No contact info"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="flex items-center h-8" asChild>
                <Link href={`/clients/${client.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View Documents</DropdownMenuItem>
                  <DropdownMenuItem>Add Task</DropdownMenuItem>
                  <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientList;
