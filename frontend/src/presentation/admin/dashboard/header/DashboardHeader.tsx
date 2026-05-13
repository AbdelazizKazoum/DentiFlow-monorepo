import React from "react";
import {Bell, Sun, Moon, Search, Settings, Menu} from "lucide-react";

interface DashboardHeaderProps {
  onToggleTheme: () => void;
  theme: "light" | "dark";
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onOpenMobile?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleTheme,
  theme,
  onToggleSidebar,
  isSidebarCollapsed,
  onOpenMobile,
}) => {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-16 gap-3 w-full bg-card">
      <div className="flex items-center gap-3 md:w-1/4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-foreground transition-all"
          title={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          <Menu size={20} />
        </button>
        <button
          onClick={onOpenMobile}
          className="flex md:hidden p-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-foreground transition-all"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-base font-semibold text-foreground tracking-tight hidden md:block whitespace-nowrap">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center justify-center flex-1 lg:max-w-xl md:mx-4 min-w-0">
        <div className="relative group flex items-center bg-page/80 dark:bg-white/[0.035] rounded-lg px-3 border border-ui-border focus-within:border-primary/45 focus-within:bg-card transition-all w-full shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <Search
            className="text-text-muted group-focus-within:text-primary transition-colors cursor-pointer shrink-0"
            size={18}
          />
          <input
            type="text"
            placeholder="Search patients, appointments"
            className="ml-2 py-2 bg-transparent text-foreground border-none outline-none w-full text-[0.9375rem] transition-all placeholder:text-text-placeholder hidden sm:block"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 md:gap-3 w-auto md:w-1/4">
        <div className="flex items-center">
          <button
            onClick={onToggleTheme}
            className="p-2 text-text-muted hover:bg-surface-hover hover:text-foreground transition-all rounded-lg"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="relative p-2 text-text-muted hover:bg-surface-hover hover:text-foreground transition-all rounded-lg"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-card" />
          </button>
          <button
            className="flex items-center gap-2 p-2 text-text-muted hover:bg-surface-hover hover:text-foreground transition-colors rounded-lg"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <div className="w-px h-6 bg-ui-border mx-2 hidden md:block" />
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
