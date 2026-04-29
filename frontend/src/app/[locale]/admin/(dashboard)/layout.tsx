"use client";
import React, { useEffect } from "react";
import { Sidebar } from "@presentation/admin/dashboard/sidebar/Sidebar";
import { DashboardHeader } from "@presentation/admin/dashboard/header/DashboardHeader";
import { useThemeStore } from "@infrastructure/theme/themeStore";
import { useSidebarStore } from "@infrastructure/theme/sidebarStore";
import { ToggleThemeUseCase } from "@application/useCases/admin/dashboard/toggleTheme";
import { ToggleSidebarUseCase } from "@application/useCases/admin/dashboard/toggleSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { theme } = useThemeStore();
  const { isCollapsed } = useSidebarStore();

  // Sync dark class on <html> with the theme store
  useEffect(() => {
    const root = document.documentElement;
    if (theme.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme.mode]);

  const handleToggleTheme = () => ToggleThemeUseCase.execute();
  const handleToggleSidebar = () => ToggleSidebarUseCase.execute();

  return (
    <div className="h-screen bg-page overflow-hidden">
      <div className="flex h-full overflow-hidden">
        <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="shrink-0 bg-card border-b border-ui-border shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] relative z-10 w-full transition-all">
            <DashboardHeader
              onToggleTheme={handleToggleTheme}
              theme={theme.mode}
              onToggleSidebar={handleToggleSidebar}
              isSidebarCollapsed={isCollapsed}
            />
          </div>
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-page p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
