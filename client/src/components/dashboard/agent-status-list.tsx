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
  const [showActivity, setShowActivity] = useState(false);
  
  // Fetch agents data
  const { data: agents = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  // Generate enhanced agent data with random stats for demo
  const agentsWithStatus = agents.map(agent => {
    const isOnline = Math.random() > 0.5;
    const lastActiveHours = Math.floor(Math.random() * 12);
    const productivity = Math.floor(Math.random() * 100);
    const leads = Math.floor(Math.random() * 30);
    const policies = Math.floor(Math.random() * 10);
    const commissions = `$${(Math.random() * 10000).toFixed(2)}`;
    
    const statuses = ["Working", "In a meeting", "On a call", "On a break", ""];
    const statusIndex = Math.floor(Math.random() * statuses.length);
    
    return {
      ...agent,
      isOnline,
      lastActive: isOnline ? 'Now' : `${lastActiveHours}h ago`,
      currentStatus: statuses[statusIndex],
      productivity,
      leads,
      policies,
      commissions
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
        <div className="flex justify-between">
          <CardDescription>
            Monitor your team's availability in real-time
          </CardDescription>
          <div className="flex items-center gap-2 text-xs">
            <span>Show Activity</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={showActivity} 
                onChange={() => setShowActivity(!showActivity)} 
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
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
                className={cn(
                  "p-3 rounded-lg transition-all", 
                  showActivity ? "bg-neutral-50 border border-neutral-100" : ""
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                      {agent.name?.charAt(0) || "A"}
                    </div>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1">
                        {agent.specialties?.split(",")[0] || "Life Insurance Agent"}
                        {agent.currentStatus && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{agent.currentStatus}</span>
                          </>
                        )}
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
                      {agent.isOnline ? "Active now" : agent.lastActive}
                    </span>
                  </div>
                </div>
                
                {showActivity && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex justify-between text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>Productivity: {agent.productivity}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserPlus className="h-3 w-3" />
                        <span>Leads: {agent.leads}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>Policies: {agent.policies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart2 className="h-3 w-3" />
                        <span>Comm: {agent.commissions}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex gap-1 justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs h-7"
                      >
                        <Link href={`/agents/${agent.id}`}>
                          View Agent
                        </Link>
                      </Button>
                      
                      <div className="flex gap-1">
                        <button 
                          className="h-7 w-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                          title="Send Email"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        
                        <button 
                          className="h-7 w-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                          title="Call Agent"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                        
                        <button 
                          className="h-7 w-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                          title="Send Message"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        
                        <button 
                          className="h-7 w-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                          title="Schedule Meeting"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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