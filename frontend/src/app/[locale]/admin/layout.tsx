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
      className="flex h-screen bg-gray-50 dark:bg-gray-900"
      style={{fontFamily: "'Poppins', sans-serif"}}
    >
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isCollapsed}
        onToggle={handleToggleSidebar}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <DashboardHeader
            onToggleTheme={handleToggleTheme}
            theme={theme.mode}
          />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
