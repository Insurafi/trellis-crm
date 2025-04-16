import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Eye } from "lucide-react";
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

const ClientList = () => {
  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  const { data: agents = [] } = useQuery<any[]>({
    queryKey: ['/api/agents'],
    enabled: !isLoading && !!clients,
  });

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

  if (!clients || clients.length === 0) {
    return <div className="p-4 text-center text-neutral-500">No clients found</div>;
  }

  return (
    <div className="px-6 py-2">
      <div className="divide-y divide-neutral-200">
        {clients.map((client) => (
          <div key={client.id} className="py-3 flex items-center">
            <img
              src={client.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`}
              alt={`${client.name} avatar`}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3 min-w-0 flex-1">
              <div className="text-sm font-medium text-neutral-900 truncate">{client.name}</div>
              <div className="text-xs text-neutral-500">{client.email || client.phone || "No contact info"}</div>
              {client.assignedAgentId && (
                <div className="text-xs mt-1 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded flex items-center">
                    <span>Assigned to: </span>
                    <span className="font-medium ml-1">
                      {agents.find(a => a.id === client.assignedAgentId)?.fullName || 
                       `Agent #${client.assignedAgentId}`}
                    </span>
                  </span>
                </div>
              )}
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
