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
    <header className="flex items-center justify-between px-6 py-4 gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-surface-hover transition-colors"
          title={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronsRight size={17} />
          ) : (
            <Menu size={17} />
          )}
        </button>

        <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
            size={15}
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 bg-page dark:text-white border-none rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 text-sm transition-all"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center bg-card rounded-lg shadow-sm divide-x divide-ui-border">
          <button
            onClick={onToggleTheme}
            className="px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-surface-hover transition-colors rounded-l-lg"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            className="relative px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-surface-hover transition-colors"
            title="Notifications"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-card"></span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:bg-surface-hover transition-colors rounded-r-lg"
            title="Settings"
          >
            <Settings size={17} />
            <span className="text-xs font-medium hidden sm:inline">
              Settings
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
