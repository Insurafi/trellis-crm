import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AgentStatusList() {
  const [view, setView] = useState<"online" | "offline" | "all">("all");
  
  // Fetch agents data
  const { data: agents = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  // In a real app, you'd have a proper online status, but for demo we'll randomize
  const agentsWithStatus = agents.map(agent => ({
    ...agent,
    isOnline: Math.random() > 0.5 // Random online status for demo purposes
  }));

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
            <Badge 
              variant={view === "all" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setView("all")}
            >
              All
            </Badge>
            <Badge 
              variant={view === "online" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setView("online")}
            >
              <UserCheck className="mr-1 h-3 w-3" />
              Online
            </Badge>
            <Badge 
              variant={view === "offline" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setView("offline")}
            >
              <UserX className="mr-1 h-3 w-3" />
              Offline
            </Badge>
          </div>
        </div>
        <CardDescription>
          Monitor your team's availability in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
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
              <li key={agent.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={agent.avatarUrl || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {agent.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-neutral-500">
                      {agent.specialties?.split(",")[0] || "Life Insurance Agent"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className={cn(
                      "h-2.5 w-2.5 rounded-full", 
                      agent.isOnline ? "bg-green-500" : "bg-neutral-300"
                    )}
                  />
                  <span className="text-sm text-neutral-600">
                    {agent.isOnline ? "Active now" : "Away"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}