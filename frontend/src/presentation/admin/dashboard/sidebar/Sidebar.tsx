import React from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Pill,
  LogOut,
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
      className={`bg-sidebar text-white flex flex-col flex-shrink-0 shadow-2xl
        transition-[width] duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-60"}`}
    >
      {/* Profile Section — always rendered, animated via max-h + opacity */}
      <div className="flex flex-col items-center py-10 px-3 overflow-hidden">
        <div
          className={`rounded-full border-4 border-white/20 overflow-hidden mb-4 shadow-xl
            transition-all duration-300 ease-in-out
            ${isCollapsed ? "w-10 h-10" : "w-24 h-24"}`}
        >
          <img
            src="https://i.pravatar.cc/150?u=drstranger"
            alt="Dr. Stranger"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Text always in DOM — delayed entrance, instant exit */}
        <div
          className={`text-center overflow-hidden transition-all duration-300 ease-in-out
            ${
              isCollapsed
                ? "max-h-0 opacity-0"
                : "max-h-16 opacity-100 delay-150"
            }`}
        >
          <h2 className="text-lg font-semibold tracking-tight whitespace-nowrap">
            Dr. Stranger
          </h2>
          <p className="text-white/60 text-xs font-medium">Dentist</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onTabChange(item.name)}
            className={`w-full flex items-center rounded-xl transition-colors duration-200 group relative py-3.5
              ${isCollapsed ? "justify-center px-0" : "px-5 gap-4"}
              ${
                activeTab === item.name
                  ? "bg-white text-primary font-semibold shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>

            {/* Label — always in DOM, delayed entrance, instant exit */}
            <span
              className={`text-[14px] whitespace-nowrap overflow-hidden
                transition-all duration-300 ease-in-out
                ${
                  isCollapsed
                    ? "max-w-0 opacity-0"
                    : "max-w-xs opacity-100 delay-150"
                }`}
            >
              {item.name}
            </span>

            {/* Tooltip — only shown when collapsed */}
            <span
              className={`absolute left-full ml-4 px-3 py-1.5 bg-card text-white text-xs
                font-medium rounded-lg pointer-events-none whitespace-nowrap z-50
                transition-opacity duration-150
                ${isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-0"}`}
            >
              {item.name}
            </span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 mb-4">
        <button
          className={`w-full flex items-center rounded-xl text-white/70
            hover:bg-white/10 hover:text-white transition-colors duration-200 py-3.5
            ${isCollapsed ? "justify-center px-0" : "px-5 gap-4"}`}
        >
          <LogOut size={22} className="flex-shrink-0" />
          <span
            className={`text-[14px] whitespace-nowrap overflow-hidden
              transition-all duration-300 ease-in-out
              ${
                isCollapsed
                  ? "max-w-0 opacity-0"
                  : "max-w-xs opacity-100 delay-150"
              }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};
