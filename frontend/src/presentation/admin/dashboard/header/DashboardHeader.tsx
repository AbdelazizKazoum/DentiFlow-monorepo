import React from "react";
import {Bell, Sun, Moon, Search, Settings} from "lucide-react";

interface DashboardHeaderProps {
  onToggleTheme: () => void;
  theme: "light" | "dark";
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleTheme,
  theme,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white tracking-tight">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center flex-wrap gap-4">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1e56d0] transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-6 py-2.5 bg-white dark:bg-slate-900 dark:text-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#1e56d0]/20 outline-none w-full md:w-64 text-sm transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          <div className="w-px h-4 bg-slate-100 dark:bg-slate-800"></div>
          <div className="flex items-center space-x-1.5 px-2">
            <span className="text-xs font-medium text-slate-400">Setting</span>
            <Settings size={16} className="text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
