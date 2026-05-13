"use client";

import React, {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {
  Calendar,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Stethoscope,
  UserCog,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {useSession} from "next-auth/react";
import {useAdminAuthStore} from "@/presentation/stores/adminAuthStore";
import {useLocale} from "next-intl";
import {usePathname, useRouter} from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
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
      {name: "Treatments", icon: <Stethoscope size={20} />},
      {name: "Waiting Room", icon: <ClipboardList size={20} />},
      {name: "Staff", icon: <UserCog size={20} />},
    ],
  },
  {
    label: "Communication",
    items: [{name: "Messages", icon: <MessageSquare size={20} />}],
  },
];

const allItems = navGroups.flatMap((g) => g.items);

const routes: Record<string, string> = {
  Dashboard: "/admin/dashboard",
  Schedule: "/admin/appointments",
  Patients: "/admin/patients",
  Treatments: "/admin/treatments",
  "Waiting Room": "/admin/waiting-room",
  Staff: "/admin/staff",
  Messages: "/admin/messages",
};

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  doctor: "Doctor",
  secretariat: "Secretary",
  dental_assistant: "Dental Assistant",
};

function SidebarContent({
  isExpanded,
  onNavigate,
}: {
  isExpanded: boolean;
  onNavigate?: () => void;
}) {
  const {data: session} = useSession();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const logout = useAdminAuthStore((s) => s.logout);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const userName = session?.user?.name ?? "User";
  const userRole = roleLabels[session?.user?.role ?? ""] ?? "Staff";
  const userInitials = userName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .trim();
  const userImage = session?.user?.image || undefined;
  const showUserImage = Boolean(userImage && failedImageUrl !== userImage);

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

  const activeTab = getActiveTab();

  const handleNavClick = (name: string) => {
    router.push(`/${locale}${routes[name]}`);
    onNavigate?.();
  };

  return (
    <>
      <div className="flex items-center px-4 py-5 gap-3 overflow-hidden shrink-0">
        <div className="w-9 h-9 rounded-lg bg-white/12 border border-white/12 flex items-center justify-center shrink-0 shadow-inner">
          <HeartPulse
            size={17}
            className="text-brand-accent"
            strokeWidth={2.5}
          />
        </div>
        <span
          className={`text-white font-normal text-[1.0625rem] tracking-tight whitespace-nowrap
            overflow-hidden transition-[width,opacity] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
            ${isExpanded ? "w-32 opacity-100" : "w-0 opacity-0"}`}
        >
          DentiFlow
        </span>
      </div>

      <div className="mx-4 h-px bg-white/10 rounded-full shrink-0" />

      <div
        className={`flex items-center overflow-hidden px-4 py-4 shrink-0
          ${isExpanded ? "gap-3" : "justify-center gap-0"}`}
      >
        <div className="relative shrink-0">
          <div
            className={`rounded-full overflow-hidden ring-2 ring-white/25 transition-[width,height] duration-300
              ${isExpanded ? "w-9 h-9" : "w-8 h-8"}`}
          >
            {showUserImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt={userName}
                className="w-full h-full object-cover"
                onError={() => setFailedImageUrl(userImage ?? null)}
              />
            ) : (
              <div className="w-full h-full bg-sidebar-muted flex items-center justify-center">
                {userInitials ? (
                  <span className="text-white text-xs font-normal leading-none">
                    {userInitials}
                  </span>
                ) : (
                  <UserRound size={16} className="text-white" />
                )}
              </div>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-[1.5px] ring-sidebar" />
        </div>

        <div
          className={`overflow-hidden transition-[width,opacity] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
            ${isExpanded ? "w-40 opacity-100" : "w-0 opacity-0"}`}
        >
          <p className="text-sidebar-text text-sm font-normal whitespace-nowrap truncate leading-tight">
            {userName}
          </p>
          <p className="text-sidebar-text-muted text-[0.6875rem] whitespace-nowrap truncate mt-0.5 uppercase tracking-[0.04em] font-normal">
            {userRole}
          </p>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/10 rounded-full shrink-0" />

      <nav className="flex-1 px-3 pt-3 space-y-5 overflow-x-hidden overflow-y-auto sidebar-scroll pb-2 min-h-0">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col">
            <div
              className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out
                ${isExpanded ? "max-h-7 opacity-100 mb-1" : "max-h-0 opacity-0 mb-0"}`}
            >
              <p className="px-3 text-[0.6875rem] font-normal tracking-[0.04em] uppercase text-sidebar-label select-none">
                {group.label}
              </p>
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const globalIdx = allItems.findIndex(
                  (i) => i.name === item.name,
                );
                const isActive = activeTab === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.name)}
                    title={!isExpanded ? item.name : undefined}
                    className={`group relative w-full h-11 flex items-center rounded-lg
                      transition-all duration-200 ease-in-out
                      ${isExpanded ? "px-3" : "justify-center"}
                      ${
                        isActive
                          ? "bg-white text-primary font-normal shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
                          : "text-sidebar-text-muted hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <span
                      className={`shrink-0 transition-transform duration-200
                        ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                    >
                      {item.icon}
                    </span>

                    <span
                      className={`text-[0.90625rem] font-normal tracking-normal whitespace-nowrap overflow-hidden leading-5 text-left
                        transition-[width,opacity,margin] duration-280 ease-in-out
                        ${isExpanded ? "w-36 opacity-100 ml-3" : "w-0 opacity-0 ml-0"}`}
                      style={{
                        transitionDelay: isExpanded
                          ? `${globalIdx * 12}ms`
                          : "0ms",
                      }}
                    >
                      {item.name}
                    </span>

                    {!isExpanded && (
                      <span
                        className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 backdrop-blur-sm
                          text-white text-xs font-normal rounded-lg pointer-events-none whitespace-nowrap z-50
                          shadow-xl border border-white/10 opacity-0 translate-x-0
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

      <div className="mx-3 mt-2 h-px bg-white/10 rounded-full shrink-0" />

      <div className="p-3 shrink-0">
        <button
          onClick={() => logout(locale)}
          title={!isExpanded ? "Logout" : undefined}
          className={`group relative h-11 w-full flex items-center rounded-lg
            text-sidebar-text-muted hover:bg-red-500/15 hover:text-red-200
            transition-all duration-200 ease-in-out
            ${isExpanded ? "px-3 gap-3" : "justify-center"}`}
        >
          <LogOut
            size={20}
            className="shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <span
            className={`text-[0.875rem] font-normal whitespace-nowrap overflow-hidden leading-5
              transition-[width,opacity] duration-280 ease-in-out
              ${isExpanded ? "w-16 opacity-100" : "w-0 opacity-0"}`}
          >
            Logout
          </span>

          {!isExpanded && (
            <span
              className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 backdrop-blur-sm
                text-white text-xs font-normal rounded-lg pointer-events-none whitespace-nowrap z-50
                shadow-xl border border-white/10 opacity-0 translate-x-0
                transition-[opacity,transform] duration-150
                group-hover:opacity-100 group-hover:translate-x-1"
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onMobileClose,
}) => {
  const [hovered, setHovered] = useState(false);
  const isDesktopExpanded = !isCollapsed || hovered;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) onMobileClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isMobileOpen, onMobileClose]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      <aside
        style={{width: isDesktopExpanded ? "260px" : "72px"}}
        className="sidebar-crisp hidden md:flex flex-col bg-sidebar text-white shrink-0 border-r border-white/10
          shadow-[4px_0_24px_rgba(11,59,73,0.18)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.38)] z-30
          transition-[width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
          will-change-[width] overflow-visible"
        onMouseEnter={() => isCollapsed && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <SidebarContent isExpanded={isDesktopExpanded} />
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-40 md:hidden"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.2}}
              onClick={onMobileClose}
              aria-hidden="true"
            />

            <motion.aside
              className="sidebar-crisp fixed left-0 top-0 h-full w-72 bg-sidebar text-white
                flex flex-col z-50 md:hidden shadow-[8px_0_40px_rgba(0,0,0,0.35)]"
              initial={{x: "-100%"}}
              animate={{x: 0}}
              exit={{x: "-100%"}}
              transition={{type: "spring", stiffness: 380, damping: 38}}
              aria-label="Navigation menu"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20
                  text-white/60 hover:text-white transition-all z-10"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>

              <SidebarContent isExpanded onNavigate={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
