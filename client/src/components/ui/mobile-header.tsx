import { Menu, Bell } from "lucide-react";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button
            id="mobile-menu-button"
            className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-3 text-xl font-bold text-primary">Trellis</span>
        </div>
        <div>
          <button className="text-neutral-500 hover:text-neutral-700 focus:outline-none ml-4">
            <Bell className="h-5 w-5" />
          </button>
          <img
            className="h-8 w-8 rounded-full ml-4 inline-block"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="User avatar"
          />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
