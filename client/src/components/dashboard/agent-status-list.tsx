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
  
  // Fetch agents data
  const { data: agents = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  // For now, we'll use a simulated approach since we haven't 
  // yet migrated the database to include the isOnline field
  
  // Generate enhanced agent data with simulated online status
  const agentsWithStatus = agents.map(agent => {
    // Temporarily simulate online status - in a real app this would come from the database
    // Some agents will show as online for demo purposes
    const isOnline = agent.id % 3 === 0; // Every third agent is online for demo
    
    return {
      ...agent,
      isOnline
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
          Monitor your team's availability in real-time
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
                        <span>Life Insurance Agent</span>
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