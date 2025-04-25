import { useQuery } from "@tanstack/react-query";
import { File, FileText, FileSpreadsheet, Download, MoreVertical, Trash } from "lucide-react";
import { Document } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return <File className="h-5 w-5 text-red-500" />;
    case "doc":
    case "docx":
      return <FileText className="h-5 w-5 text-blue-500" />;
    case "xls":
    case "xlsx":
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    default:
      return <FileText className="h-5 w-5 text-neutral-500" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return "bg-red-100 text-red-500";
    case "doc":
    case "docx":
      return "bg-blue-100 text-blue-500";
    case "xls":
    case "xlsx":
      return "bg-green-100 text-green-600";
    default:
      return "bg-neutral-100 text-neutral-600";
  }
};

const DocumentTable = () => {
  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/documents/${id}`);
      
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
        variant: "default",
      });
      
      // Invalidate document queries
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    } catch (error) {
      toast({
        title: "Error deleting document",
        description: "An error occurred while deleting the document.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div>Error loading documents</div>;
  }

  if (!documents || documents.length === 0) {
    return <div className="p-4 text-center text-neutral-500">No documents found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead>
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {documents.map(document => (
            <tr key={document.id}>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getFileIcon(document.type)}
                  <span className="ml-2 text-sm font-medium text-neutral-900">{document.name}</span>
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-neutral-600">
                {document.clientId ? `Client ID: ${document.clientId}` : "No client"}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-neutral-600">
                {document.uploadedAt ? format(new Date(document.uploadedAt), 'MMM dd, yyyy') : "Unknown date"}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(document.type)}`}>
                  {document.type.toUpperCase()}
                </span>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon" className="text-primary hover:text-blue-700">
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-900">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(document.id)} className="text-red-500">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentTable;
