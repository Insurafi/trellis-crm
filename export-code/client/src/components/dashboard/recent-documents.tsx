import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DocumentTable from "../ui/document-table";
import { Skeleton } from "@/components/ui/skeleton";

const RecentDocuments = () => {
  const { isLoading, error } = useQuery({
    queryKey: ['/api/documents'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-neutral-900">Recent Documents</CardTitle>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div>Error loading documents</div>;
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-900">Recent Documents</CardTitle>
          <Button variant="link" className="text-primary p-0">View All</Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <DocumentTable />
      </CardContent>
    </Card>
  );
};

export default RecentDocuments;
