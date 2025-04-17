import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Calendar,
  CheckSquare,
  Mail,
  BarChart2,
  DollarSign,
  MessageSquare,
  Settings,
  UserCheck,
  UserSearch,
  Shield,
  GraduationCap,
  LineChart,
  UserCog
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [location] = useLocation();
  const { user, isAdmin, isAgent, isTeamLeader, logoutMutation } = useAuth();

  // Base navigation items for all authenticated users
  const baseNavItems = [
    { path: "/clients", icon: <Users className="mr-3 h-5 w-5" />, label: "Clients" },
    { path: "/leads", icon: <UserSearch className="mr-3 h-5 w-5" />, label: "Leads" },
    { path: "/policies", icon: <Shield className="mr-3 h-5 w-5" />, label: "Policies" },
    { path: "/documents", icon: <FileText className="mr-3 h-5 w-5" />, label: "Documents" },
    { path: "/quotes", icon: <Tag className="mr-3 h-5 w-5" />, label: "Quotes" },
    { path: "/calendar", icon: <Calendar className="mr-3 h-5 w-5" />, label: "Calendar" },
    { path: "/tasks", icon: <CheckSquare className="mr-3 h-5 w-5" />, label: "Tasks" },
    { path: "/pipeline", icon: <BarChart2 className="mr-3 h-5 w-5" />, label: "Pipeline" },
    { path: "/commissions", icon: <DollarSign className="mr-3 h-5 w-5" />, label: "Commissions" },
    { path: "/communications", icon: <MessageSquare className="mr-3 h-5 w-5" />, label: "Scripts" },
    { path: "/training", icon: <GraduationCap className="mr-3 h-5 w-5" />, label: "Training" },
  ];

  // Specific navigation items based on user role
  let navItems = [];
  
  if (isAgent) {
    // Agent-specific navigation
    navItems = [
      { path: "/agent-dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, label: "Dashboard" },
      { path: "/agent-profile", icon: <UserCog className="mr-3 h-5 w-5" />, label: "My Profile" },
      ...baseNavItems
    ];
  } else {
    // Admin/TeamLeader/Support navigation
    navItems = [
      { path: "/dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, label: "Admin Dashboard" },
      ...baseNavItems,
      { path: "/marketing", icon: <Mail className="mr-3 h-5 w-5" />, label: "Marketing" },
      { path: "/analytics", icon: <LineChart className="mr-3 h-5 w-5" />, label: "Analytics" },
    ];
    
    // Add Team Management for admin users (it's already in the navItems array)
    // Make it more visible by placing it near the top for admin users
    if (isAdmin) {
      // Insert Team Management right after Dashboard
      navItems.splice(1, 0, { 
        path: "/users", 
        icon: <Users className="mr-3 h-5 w-5" />, 
        label: "Team Management" 
      });
    }
  }

  // Handle clicking outside on mobile
  const handleOutsideClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const sidebarClasses = cn(
    "md:flex md:flex-shrink-0",
    {
      "fixed inset-0 z-40 flex": isOpen,
      "hidden": !isOpen
    }
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={handleOutsideClick}
        />
      )}
      
      <div id="sidebar" className={sidebarClasses}>
        <div className="flex flex-col w-64 bg-white border-r border-neutral-200">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-neutral-200">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">Trellis</span>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex flex-col flex-grow px-4 pt-5 pb-4 overflow-y-auto no-scrollbar">
            <div className="flex-grow flex flex-col">
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <Link 
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      location === item.path
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center p-4 border-t border-neutral-200">
            <div className="flex-shrink-0">
              <img 
                className="h-8 w-8 rounded-full" 
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                alt="User avatar" 
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-800">{user?.fullName || "User"}</p>
              <p className="text-xs font-medium text-neutral-500">
                {isAdmin 
                  ? "Administrator" 
                  : isTeamLeader 
                    ? "Team Leader" 
                    : isAgent 
                      ? "Agent" 
                      : "Support"}
              </p>
            </div>
            <div className="ml-auto flex">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to log out?')) {
                    logoutMutation.mutate();
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800 px-2"
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
