import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Pill,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const sidebarItems = [
  {name: "Dashboard", icon: <LayoutDashboard size={22} />},
  {name: "Schedule", icon: <Calendar size={22} />},
  {name: "Patients", icon: <Users size={22} />},
  {name: "Messages", icon: <MessageSquare size={22} />},
  {name: "Medicines", icon: <Pill size={22} />},
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggle,
}) => {
  return (
    <aside
      className={`h-screen bg-[#1e56d0] dark:bg-slate-900 text-white flex flex-col transition-all duration-300 shadow-2xl ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-10 bg-white dark:bg-slate-800 text-[#1e56d0] dark:text-white p-1 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform"
      >
        {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Profile Section */}
      <div
        className={`flex flex-col items-center py-10 transition-all duration-300 ${isCollapsed ? "px-2" : "px-6"}`}
      >
        <div
          className={`rounded-full border-4 border-white/20 overflow-hidden mb-4 shadow-xl transition-all duration-300 ${isCollapsed ? "w-10 h-10" : "w-24 h-24"}`}
        >
          <img
            src="https://i.pravatar.cc/150?u=drstranger"
            alt="Dr. Stranger"
            className="w-full h-full object-cover"
          />
        </div>
        {!isCollapsed && (
          <div className="text-center">
            <h2 className="text-lg font-semibold tracking-tight">
              Dr. Stranger
            </h2>
            <p className="text-white/60 text-xs font-medium">Dentist</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onTabChange(item.name)}
            className={`w-full flex items-center rounded-xl transition-all duration-200 group relative ${
              isCollapsed ? "justify-center py-3.5" : "px-5 py-3.5 space-x-4"
            } ${
              activeTab === item.name
                ? "bg-white text-[#1e56d0] font-semibold shadow-md"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            {!isCollapsed && <span className="text-[14px]">{item.name}</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 mb-4">
        <button
          className={`w-full flex items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all ${
            isCollapsed ? "justify-center py-3.5" : "px-5 py-3.5 space-x-4"
          }`}
        >
          <LogOut size={22} />
          {!isCollapsed && <span className="text-[14px]">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
