import React, {useState} from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MessageSquare,
  Pill,
  LogOut,
} from "lucide-react";
import {useAdminAuthStore} from "@/presentation/stores/adminAuthStore";
import {useLocale} from "next-intl";

import {usePathname, useRouter} from "next/navigation";

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
    items: [{name: "Dashboard", icon: <LayoutDashboard size={20} />}],
  },
  {
    label: "Clinical",
    items: [
      {name: "Schedule", icon: <Calendar size={20} />},
      {name: "Patients", icon: <Users size={20} />},
      {name: "Medicines", icon: <Pill size={20} />},
    ],
  },
  {
    label: "Communication",
    items: [{name: "Messages", icon: <MessageSquare size={20} />}],
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

export const Sidebar: React.FC<SidebarProps> = ({isCollapsed}) => {
  const [hovered, setHovered] = useState(false);
  const isExpanded = !isCollapsed || hovered;

  const logout = useAdminAuthStore((s) => s.logout);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const getRouteForTab = (tabName: string) => {
    switch (tabName) {
      case "Dashboard":
        return `/${locale}/admin/dashboard`;
      case "Schedule":
        return `/${locale}/admin/schedule`;
      case "Patients":
        return `/${locale}/admin/patients`;
      case "Medicines":
        return `/${locale}/admin/medicines`;
      case "Messages":
        return `/${locale}/admin/messages`;
      default:
        return `/${locale}/admin/dashboard`;
    }
  };

  const getActiveTab = () => {
    if (pathname.includes("/admin/dashboard")) return "Dashboard";
    if (pathname.includes("/admin/schedule")) return "Schedule";
    if (pathname.includes("/admin/patients")) return "Patients";
    if (pathname.includes("/admin/medicines")) return "Medicines";
    if (pathname.includes("/admin/messages")) return "Messages";
    return "Dashboard";
  };

  const activeTab = getActiveTab();

  return (
    <aside
      style={{width: isExpanded ? "256px" : "68px"}}
      className="bg-sidebar text-white flex flex-col shrink-0 shadow-2xl
        transition-[width] duration-380 ease-[cubic-bezier(0.65,0,0.35,1)]
        will-change-[width] overflow-hidden"
      onMouseEnter={() => isCollapsed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Profile ── */}
      <div className="flex flex-col items-center py-8 overflow-hidden px-3">
        <div
          className={`relative rounded-full overflow-hidden shadow-xl ring-2 ring-white/20
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
          <h2 className="text-[15px] font-semibold tracking-tight whitespace-nowrap leading-snug">
            Dr. Stranger
          </h2>
          <p className="text-white/50 text-[11px] font-medium tracking-wide uppercase mt-0.5">
            Dentist
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-3 mb-3 h-px bg-white/10 rounded-full" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2.5 space-y-5 overflow-hidden">
        {navGroups.map((group) => (
          <div key={group.label}>
            {/* Group label */}
            <div
              className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out
                ${
                  isExpanded
                    ? "max-h-8 opacity-100 delay-160"
                    : "max-h-0 opacity-0 delay-[0ms]"
                }`}
            >
              <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest uppercase text-white/35 select-none">
                {group.label}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const globalIndex = allItems.findIndex(
                  (i) => i.name === item.name,
                );
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(getRouteForTab(item.name))}
                    className={`group relative w-full h-10 flex items-center rounded-xl
                      transition-colors duration-200 ease-in-out
                      ${isExpanded ? "px-4" : "justify-center"}
                      ${
                        isActive
                          ? "bg-white text-primary font-semibold shadow-lg shadow-black/20"
                          : "text-white/65 hover:bg-white/10 hover:text-white"
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
                      className={`text-[13.5px] whitespace-nowrap overflow-hidden leading-none text-left
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
          className={`group relative w-full h-10 flex items-center rounded-xl
            text-white/55 hover:bg-red-500/15 hover:text-red-300
            transition-colors duration-200 ease-in-out
            ${isExpanded ? "px-4" : "justify-center"}`}
        >
          <LogOut
            size={20}
            className="shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <span
            className={`text-[13.5px] whitespace-nowrap overflow-hidden leading-none text-left
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
