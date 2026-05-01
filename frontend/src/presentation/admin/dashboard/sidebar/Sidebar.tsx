import React, { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  MessageSquare,
  ClipboardList,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { useAdminAuthStore } from "@/presentation/stores/adminAuthStore";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", icon: <LayoutDashboard size={20} /> }],
  },
  {
    label: "Clinical",
    items: [
      { name: "Schedule", icon: <Calendar size={20} /> },
      { name: "Patients", icon: <Users size={20} /> },
      { name: "Treatments", icon: <Stethoscope size={20} /> },
      { name: "Waiting Room", icon: <ClipboardList size={20} /> },
      { name: "Staff", icon: <UserCog size={20} /> },
    ],
  },
  {
    label: "Communication",
    items: [{ name: "Messages", icon: <MessageSquare size={20} /> }],
  },
];

// Flat ordered list for stagger index calculation
const allItems = navGroups.flatMap((g) => g.items);

const staggerDelays = [
  "delay-[0ms]",
  "delay-[40ms]",
  "delay-[80ms]",
  "delay-[120ms]",
  "delay-[160ms]",
];

const routes: Record<string, string> = {
  Dashboard: "/admin/dashboard",
  Schedule: "/admin/appointments",
  Patients: "/admin/patients",
  Treatments: "/admin/treatments",
  "Waiting Room": "/admin/waiting-room",
  Staff: "/admin/staff",
  Messages: "/admin/messages",
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const [hovered, setHovered] = useState(false);
  const isExpanded = !isCollapsed || hovered;

  const logout = useAdminAuthStore((s) => s.logout);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.includes("/appointments")) return "Schedule";
    if (pathname.includes("/patients")) return "Patients";
    if (pathname.includes("/treatments")) return "Treatments";
    if (pathname.includes("/waiting-room")) return "Waiting Room";
    if (pathname.includes("/staff")) return "Staff";
    if (pathname.includes("/messages")) return "Messages";
    if (pathname.includes("/dashboard")) return "Dashboard";
    return "";
  };

  return (
    <aside
      style={{ width: isExpanded ? "260px" : "72px" }}
      className="bg-sidebar text-white flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.25)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-30
        transition-[width] duration-380 ease-[cubic-bezier(0.65,0,0.35,1)]
        will-change-[width] overflow-hidden"
      onMouseEnter={() => isCollapsed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Profile ── */}
      <div className="flex flex-col items-center py-8 overflow-hidden px-3">
        <div
          className={`relative rounded-full overflow-hidden shadow-lg ring-[3px] ring-white/20
            transition-[width,height,margin] duration-380 ease-[cubic-bezier(0.65,0,0.35,1)]
            ${isExpanded ? "w-20 h-20 mb-4" : "w-9 h-9 mb-0"}`}
        >
          <img
            src="https://i.pravatar.cc/150?u=drstranger"
            alt="Dr. Stranger"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name + role */}
        <div
          className={`text-center overflow-hidden
            transition-[max-height,opacity,transform] duration-300 ease-in-out
            ${
              isExpanded
                ? "max-h-16 opacity-100 translate-y-0 delay-180"
                : "max-h-0 opacity-0 -translate-y-1 delay-[0ms]"
            }`}
        >
          <h2 className="text-[1rem] font-semibold tracking-tight whitespace-nowrap leading-snug">
            Dr. Stranger
          </h2>
          <p className="text-white/40 text-[0.75rem] font-normal tracking-widest uppercase mt-0.5">
            Dentist
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mb-4 h-px bg-white/5 rounded-full" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pt-2 space-y-7 overflow-x-hidden overflow-y-auto sidebar-scroll">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col">
            {/* Group label */}
            <div
              className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out
                ${
                  isExpanded
                    ? "max-h-8 opacity-100 mb-2 delay-150"
                    : "max-h-0 opacity-0 mb-0 delay-0"
                }`}
            >
              <p className="px-4 text-[0.6875rem] font-semibold tracking-widest uppercase text-white/50 select-none">
                {group.label}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const globalIndex = allItems.findIndex(
                  (i) => i.name === item.name,
                );
                const isActive = getActiveTab() === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() =>
                      router.push(`/${locale}${routes[item.name]}`)
                    }
                    className={`group relative w-full h-11.5 flex items-center rounded-xl
                      transition-all duration-200 ease-in-out
                      ${isExpanded ? "px-4 mx-1 w-[calc(100%-8px)]" : "justify-center"}
                      ${
                        isActive
                          ? "bg-white text-primary dark:bg-linear-to-r dark:from-primary dark:to-primary-dark dark:text-white font-semibold shadow-[0_4px_12px_rgba(255,255,255,0.2)] dark:shadow-primary/40 transform -translate-y-0.5"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {/* Icon — centered when collapsed, left-aligned when expanded */}
                    <span
                      className={`shrink-0 transition-transform duration-200
                        ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                    >
                      {item.icon}
                    </span>

                    {/* Label — width+opacity transition, no layout shift */}
                    <span
                      className={`text-[0.9375rem] whitespace-nowrap overflow-hidden leading-none text-left
                        transition-[width,opacity,margin] duration-280 ease-in-out
                        ${
                          isExpanded
                            ? `w-36 opacity-100 ml-3 ${staggerDelays[globalIndex] ?? "delay-0"}`
                            : "w-0 opacity-0 ml-0 delay-[0ms]"
                        }`}
                    >
                      {item.name}
                    </span>

                    {/* Tooltip when collapsed */}
                    {!isExpanded && (
                      <span
                        className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 backdrop-blur-sm
                          text-white text-xs font-medium rounded-lg pointer-events-none whitespace-nowrap z-50
                          shadow-xl border border-white/10
                          opacity-0 translate-x-0
                          transition-[opacity,transform] duration-150
                          group-hover:opacity-100 group-hover:translate-x-1"
                      >
                        {item.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-3 mt-3 h-px bg-white/10 rounded-full" />

      {/* ── Logout ── */}
      <div className="p-2.5 mb-3">
        <button
          onClick={() => logout(locale)}
          className={`group relative h-11 flex items-center rounded-lg
            text-white/60 hover:bg-red-500/10 hover:text-red-400
            transition-all duration-200 ease-in-out
            ${isExpanded ? "px-4 mx-1 w-[calc(100%-8px)]" : "w-full justify-center"}`}
        >
          <LogOut
            size={20}
            className="shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <span
            className={`text-[0.9375rem] whitespace-nowrap overflow-hidden leading-none text-left
              transition-[width,opacity,margin] duration-280 ease-in-out
              ${
                isExpanded
                  ? "w-24 opacity-100 ml-3 delay-200"
                  : "w-0 opacity-0 ml-0 delay-0"
              }`}
          >
            Logout
          </span>

          {/* Tooltip */}
          {!isExpanded && (
            <span
              className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 backdrop-blur-sm
                text-white text-xs font-medium rounded-lg pointer-events-none whitespace-nowrap z-50
                shadow-xl border border-white/10
                opacity-0 translate-x-0
                transition-[opacity,transform] duration-150
                group-hover:opacity-100 group-hover:translate-x-1"
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
