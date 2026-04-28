import React from "react";
import {
  Bell,
  Sun,
  Moon,
  Search,
  Settings,
  Menu,
  ChevronsRight,
} from "lucide-react";

interface DashboardHeaderProps {
  onToggleTheme: () => void;
  theme: "light" | "dark";
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleTheme,
  theme,
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  return (
    <header className="flex items-center justify-between px-6 h-16 gap-4 w-full bg-card">
      <div className="flex items-center gap-3 w-1/4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-surface-hover hover:text-slate-700 dark:hover:text-white transition-all"
          title={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          <Menu size={20} />
        </button>

        <h1 className="text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight hidden md:block whitespace-nowrap">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center justify-center flex-1 lg:max-w-xl mx-4">
        {/* Search */}
        <div className="relative group flex items-center bg-transparent md:bg-surface-hover/50 dark:md:bg-surface-hover/30 rounded-full px-3 md:border border-transparent md:border-ui-border focus-within:border-primary/30 transition-all w-full">
          <Search
            className="text-slate-400 group-focus-within:text-primary transition-colors cursor-pointer shrink-0"
            size={18}
          />
          <input
            type="text"
            placeholder="Search (Ctrl+/)"
            className="ml-2 py-2 bg-transparent text-slate-600 dark:text-slate-200 border-none outline-none w-full text-[0.9375rem] transition-all placeholder:text-slate-400 hidden sm:block"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 md:gap-3 w-auto md:w-1/4">
        {/* Action buttons */}
        <div className="flex items-center">
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-surface-hover hover:text-slate-700 dark:hover:text-white transition-all rounded-full"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-surface-hover hover:text-slate-700 dark:hover:text-white transition-all rounded-full"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-card"></span>
          </button>
          <button
            className="flex items-center gap-2 p-2 text-slate-500 hover:bg-surface-hover hover:text-slate-700 transition-colors rounded-full"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
          <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 ml-2 hidden md:block cursor-pointer hover:border-primary transition-colors">
            <img
              src="https://i.pravatar.cc/150?u=drstranger"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
