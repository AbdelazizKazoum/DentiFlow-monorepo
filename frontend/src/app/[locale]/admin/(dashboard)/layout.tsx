"use client";
import React, {useEffect, useState} from "react";
import {Sidebar} from "@presentation/admin/dashboard/sidebar/Sidebar";
import {DashboardHeader} from "@presentation/admin/dashboard/header/DashboardHeader";
import {useThemeStore} from "@infrastructure/theme/themeStore";
import {useSidebarStore} from "@infrastructure/theme/sidebarStore";
import {ToggleThemeUseCase} from "@application/useCases/admin/dashboard/toggleTheme";
import {ToggleSidebarUseCase} from "@application/useCases/admin/dashboard/toggleSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({children}: AdminLayoutProps) {
  const {theme} = useThemeStore();
  const {isCollapsed} = useSidebarStore();
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Sync dark class on <html> with the theme store
  useEffect(() => {
    const root = document.documentElement;
    if (theme.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme.mode]);

  // Inject Poppins Font for admin pages
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleToggleTheme = () => ToggleThemeUseCase.execute();
  const handleToggleSidebar = () => ToggleSidebarUseCase.execute();

  return (
    <div
      className="h-screen bg-page overflow-hidden"
      style={{fontFamily: "'Poppins', sans-serif"}}
    >
      <div className="flex h-full overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isCollapsed}
          onToggle={handleToggleSidebar}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-shrink-0 bg-card border-b border-ui-border shadow-sm">
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
