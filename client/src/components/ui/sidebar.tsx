import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Calendar,
  CheckSquare,
  Mail,
  Image,
  MessageSquare,
  Settings
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, label: "Dashboard" },
    { path: "/clients", icon: <Users className="mr-3 h-5 w-5" />, label: "Clients" },
    { path: "/documents", icon: <FileText className="mr-3 h-5 w-5" />, label: "Documents" },
    { path: "/quotes", icon: <Tag className="mr-3 h-5 w-5" />, label: "Quotes" },
    { path: "/calendar", icon: <Calendar className="mr-3 h-5 w-5" />, label: "Calendar" },
    { path: "/tasks", icon: <CheckSquare className="mr-3 h-5 w-5" />, label: "Tasks" },
    { path: "/marketing", icon: <Mail className="mr-3 h-5 w-5" />, label: "Marketing" },
  ];

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
              <span className="text-2xl font-bold text-primary">ClientFlow</span>
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
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="User avatar" 
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-800">Alex Johnson</p>
              <p className="text-xs font-medium text-neutral-500">Administrator</p>
            </div>
            <button className="ml-auto text-neutral-400 hover:text-neutral-600">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
