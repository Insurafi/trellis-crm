import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  UserCheck, 
  UserX, 
  Phone, 
  Mail, 
  MessageSquare,
  Calendar,
  BarChart2,
  UserPlus,
  Activity,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// Simplified version
export default function AgentStatusList() {
  const [view, setView] = useState<"online" | "offline" | "all">("all");
  // No longer need activity state
  
  // Fetch agents data with refetch interval for real-time online status
  const { data: agents = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/agents"],
    refetchInterval: 30000, // Refetch every 30 seconds to keep online status fresh
  });

  // Fetch clients data to count new clients per agent
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ["/api/clients"],
    enabled: !isLoading && agents.length > 0,
  });

  // Calculate new clients for each agent
  // For this example, we'll define "new clients" as clients created in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Use the actual online status data from the agent's linked user and add new client count
  const agentsWithStatus = agents.map(agent => {
    // Special case for Aaron Barnes (agent ID 4) - don't show new clients for him
    if (agent.id === 4) {
      return {
        ...agent,
        newClientsCount: 0 // Zero out new clients count for Aaron
      };
    }
    
    // Count new clients for other agents
    const newClientsCount = clients.filter(client => {
      const clientCreatedDate = new Date(client.createdAt);
      return (
        client.assignedAgentId === agent.id && 
        clientCreatedDate > thirtyDaysAgo
      );
    }).length;
    
    return {
      ...agent,
      newClientsCount
    };
  });

  const filteredAgents = view === "all" 
    ? agentsWithStatus 
    : view === "online" 
      ? agentsWithStatus.filter(agent => agent.isOnline) 
      : agentsWithStatus.filter(agent => !agent.isOnline);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">Agent Status</CardTitle>
          <div className="flex space-x-2">
            <button 
              className={cn(
                "px-2 py-1 text-xs rounded-full", 
                view === "all" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-700"
              )}
              onClick={() => setView("all")}
            >
              All
            </button>
            <button 
              className={cn(
                "px-2 py-1 text-xs rounded-full flex items-center", 
                view === "online" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-700"
              )}
              onClick={() => setView("online")}
            >
              <UserCheck className="mr-1 h-3 w-3" />
              Online
            </button>
            <button 
              className={cn(
                "px-2 py-1 text-xs rounded-full flex items-center", 
                view === "offline" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-700"
              )}
              onClick={() => setView("offline")}
            >
              <UserX className="mr-1 h-3 w-3" />
              Offline
            </button>
          </div>
        </div>
        <CardDescription>
          Monitor your team's availability status
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-pulse text-sm text-neutral-500">Loading agents...</div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-6 text-sm text-neutral-500">
            No {view === "all" ? "" : view} agents found
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredAgents.map((agent) => (
              <li 
                key={agent.id} 
                className="p-3 rounded-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                      {agent.name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1">
                        <span>Agent</span>
                        {agent.newClientsCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full flex items-center">
                            <UserPlus className="h-3 w-3 mr-1" />
                            {agent.newClientsCount} new client{agent.newClientsCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className={cn(
                        "h-2.5 w-2.5 rounded-full", 
                        agent.isOnline ? "bg-green-500" : ""
                      )}
                    />
                    <span className="text-sm text-neutral-600">
                      {agent.isOnline ? "Active now" : ""}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="text-xs text-neutral-500">
          {filteredAgents.length} agents {view !== "all" ? `(${view})` : ""}
        </div>
        <Link href="/agents">
          <Button variant="link" size="sm" className="text-xs p-0 h-auto">
            View All Agents
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}