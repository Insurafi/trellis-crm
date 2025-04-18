import { useQuery } from "@tanstack/react-query";
import { ArrowUpIcon, ArrowDownIcon, User, DollarSign, CheckSquare, CalendarCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: number;
  icon: JSX.Element;
  iconBgColor: string;
  iconTextColor: string;
  changePercentage?: number;
  changeText?: string;
}

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconTextColor,
  changePercentage,
  changeText 
}: MetricCardProps) => {
  const isPositiveChange = changePercentage && changePercentage > 0;
  
  return (
    <Card className="p-6 border border-neutral-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <h3 className="text-xl font-bold text-neutral-900">{value}</h3>
        </div>
      </div>
      {(changePercentage !== undefined && changeText) && (
        <div className="mt-4">
          <div className="flex items-center">
            <span className={`text-sm font-medium flex items-center ${isPositiveChange ? 'text-green-600' : 'text-red-500'}`}>
              {isPositiveChange ? (
                <ArrowUpIcon className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDownIcon className="mr-1 h-4 w-4" />
              )}
              {Math.abs(changePercentage)}%
            </span>
            <span className="text-sm text-neutral-600 ml-2">{changeText}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

const MetricCardSkeleton = () => (
  <Card className="p-6 border border-neutral-200">
    <div className="flex items-center">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="ml-5 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
    <div className="mt-4">
      <Skeleton className="h-4 w-36" />
    </div>
  </Card>
);

interface DashboardStats {
  totalClients: number;
  pendingQuotes: number;
  activeTasks: number;
  upcomingMeetings: number;
}

const DashboardMetrics = () => {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    );
  }

  if (error) {
    return <div>Error loading dashboard metrics</div>;
  }

  // Ensure data is not undefined
  const stats = data || {
    totalClients: 0,
    pendingQuotes: 0,
    activeTasks: 0,
    upcomingMeetings: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Total Clients"
        value={stats.totalClients}
        icon={<User className="h-5 w-5" />}
        iconBgColor="bg-blue-100"
        iconTextColor="text-primary"
        changePercentage={0}
        changeText="new today (April 18)"
      />
      
      <MetricCard
        title="Pending Quotes"
        value={stats.pendingQuotes}
        icon={<DollarSign className="h-5 w-5" />}
        iconBgColor="bg-green-100"
        iconTextColor="text-green-600"
        changePercentage={0}
        changeText="from last month"
      />
      
      <MetricCard
        title="Active Tasks"
        value={stats.activeTasks}
        icon={<CheckSquare className="h-5 w-5" />}
        iconBgColor="bg-indigo-100"
        iconTextColor="text-indigo-600"
        changePercentage={0}
        changeText="from last week"
      />
      
      <MetricCard
        title="Upcoming Meetings"
        value={stats.upcomingMeetings}
        icon={<CalendarCheck className="h-5 w-5" />}
        iconBgColor="bg-yellow-100"
        iconTextColor="text-amber-500"
        changePercentage={0}
        changeText="from yesterday"
      />
    </div>
  );
};

export default DashboardMetrics;
