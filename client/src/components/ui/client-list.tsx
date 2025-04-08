import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { Client } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
              <div className="text-xs text-neutral-500">{client.company || "No company"}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 text-neutral-400 hover:text-neutral-600">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>View Documents</DropdownMenuItem>
                <DropdownMenuItem>Create Quote</DropdownMenuItem>
                <DropdownMenuItem>Add Task</DropdownMenuItem>
                <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientList;
