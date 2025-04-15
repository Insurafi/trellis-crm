import DashboardMetrics from "@/components/ui/dashboard-metrics";
import TaskManagement from "@/components/dashboard/task-management";
import PortfolioShowcase from "@/components/ui/portfolio-showcase";
import CalendarCard from "@/components/ui/calendar-card";
import AgentStatusList from "@/components/dashboard/agent-status-list";
import ClientReviews from "@/components/ui/client-reviews";
import { Button } from "@/components/ui/button";
import { Plus, Filter, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  return (
    <div className="pt-0 md:pt-6 pb-6 px-4 md:px-8 md:mt-0 mt-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600">Welcome back, Alex! Here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button className="inline-flex items-center" asChild>
            <Link href="/client-login-new">
              <ExternalLink className="mr-2 h-4 w-4" />
              Client Portal
            </Link>
          </Button>
          <Button className="inline-flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
          <Button variant="outline" className="inline-flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      {/* Dashboard Metrics */}
      <DashboardMetrics />
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <TaskManagement />
          <PortfolioShowcase />
        </div>
        
        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          <CalendarCard />
          <AgentStatusList />
          <ClientReviews />
        </div>
      </div>
    </div>
  );
}
