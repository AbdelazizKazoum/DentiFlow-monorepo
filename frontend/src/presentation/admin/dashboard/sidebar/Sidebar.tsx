import React, {useState} from "react";
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
  // hovered is only relevant when sidebar is collapsed by the user button
  const [hovered, setHovered] = useState(false);

  // The visual state: expanded if either explicitly opened OR hovering while collapsed
  const isExpanded = !isCollapsed || hovered;

  return (
    <aside
      className={`bg-sidebar text-white flex flex-col flex-shrink-0 shadow-2xl
        transition-[width] duration-300 ease-in-out
        ${isExpanded ? "w-60" : "w-16"}`}
      onMouseEnter={() => isCollapsed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Profile Section — always rendered, animated via max-h + opacity */}
      <div className="flex flex-col items-center py-10 px-3 overflow-hidden">
        <div
          className={`rounded-full border-4 border-white/20 overflow-hidden mb-4 shadow-xl
            transition-all duration-300 ease-in-out
            ${isExpanded ? "w-24 h-24" : "w-10 h-10"}`}
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
            ${isExpanded ? "max-h-16 opacity-100 delay-150" : "max-h-0 opacity-0"}`}
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
            className={`w-full h-11 flex items-center rounded-xl transition-colors duration-200 group relative
              ${isExpanded ? "px-5 gap-4" : "justify-center"}
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
                ${isExpanded ? "max-w-xs opacity-100 delay-150" : "max-w-0 opacity-0"}`}
            >
              {item.name}
            </span>

            {/* Tooltip — only shown when fully collapsed and not hovered */}
            <span
              className={`absolute left-full ml-4 px-3 py-1.5 bg-card text-white text-xs
                font-medium rounded-lg pointer-events-none whitespace-nowrap z-50
                transition-opacity duration-150
                ${!isExpanded ? "opacity-0 group-hover:opacity-100" : "opacity-0"}`}
            >
              {item.name}
            </span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 mb-4">
        <button
          className={`w-full h-11 flex items-center rounded-xl text-white/70
            hover:bg-white/10 hover:text-white transition-colors duration-200
            ${isExpanded ? "px-5 gap-4" : "justify-center"}`}
        >
          <LogOut size={22} className="flex-shrink-0" />
          <span
            className={`text-[14px] whitespace-nowrap overflow-hidden
              transition-all duration-300 ease-in-out
              ${isExpanded ? "max-w-xs opacity-100 delay-150" : "max-w-0 opacity-0"}`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};
