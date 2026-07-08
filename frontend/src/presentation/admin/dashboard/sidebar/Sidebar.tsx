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
import {useLocale, useTranslations} from "next-intl";
import {usePathname, useRouter} from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  id: string;
  icon: React.ReactNode;
}

interface NavGroup {
  id: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "overview",
    items: [{id: "dashboard", icon: <LayoutDashboard size={20} />}],
  },
  {
    id: "clinical",
    items: [
      {id: "schedule", icon: <Calendar size={20} />},
      {id: "patients", icon: <Users size={20} />},
      {id: "treatments", icon: <Stethoscope size={20} />},
      {id: "waitingRoom", icon: <ClipboardList size={20} />},
      {id: "staff", icon: <UserCog size={20} />},
    ],
  },
  {
    id: "communication",
    items: [{id: "messages", icon: <MessageSquare size={20} />}],
  },
];

const allItems = navGroups.flatMap((g) => g.items);

const routes: Record<string, string> = {
  dashboard: "/admin/dashboard",
  schedule: "/admin/appointments",
  patients: "/admin/patients",
  treatments: "/admin/treatments",
  waitingRoom: "/admin/waiting-room",
  staff: "/admin/staff",
  messages: "/admin/messages",
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
  const t = useTranslations("admin.sidebar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const userName = session?.user?.name ?? t("userFallback");
  const userRoleKey = session?.user?.role ?? "staff";
  const userRole = t(`roles.${userRoleKey}`);
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
    if (pathname.includes("/appointments")) return "schedule";
    if (pathname.includes("/patients")) return "patients";
    if (pathname.includes("/treatments")) return "treatments";
    if (pathname.includes("/waiting-room")) return "waitingRoom";
    if (pathname.includes("/staff")) return "staff";
    if (pathname.includes("/messages")) return "messages";
    if (pathname.includes("/dashboard")) return "dashboard";
    return "";
  };

  const activeTab = getActiveTab();

  const handleNavClick = (id: string) => {
    router.push(`/${locale}${routes[id]}`);
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
          <div key={group.id} className="flex flex-col">
            <div
              className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out
                ${isExpanded ? "max-h-7 opacity-100 mb-1" : "max-h-0 opacity-0 mb-0"}`}
            >
              <p className="px-3 text-[0.6875rem] font-normal tracking-[0.04em] uppercase text-sidebar-label select-none">
                {t(`groups.${group.id}`)}
              </p>
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const globalIdx = allItems.findIndex(
                  (i) => i.id === item.id,
                );
                const isActive = activeTab === item.id;
                const itemLabel = t(`items.${item.id}`);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={!isExpanded ? itemLabel : undefined}
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
                      {itemLabel}
                    </span>

                    {!isExpanded && (
                      <span
                        className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 backdrop-blur-sm
                          text-white text-xs font-normal rounded-lg pointer-events-none whitespace-nowrap z-50
                          shadow-xl border border-white/10 opacity-0 translate-x-0
                          transition-[opacity,transform] duration-150
                          group-hover:opacity-100 group-hover:translate-x-1"
                      >
                        {itemLabel}
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
          title={!isExpanded ? t("logout") : undefined}
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
            {t("logout")}
          </span>

          {!isExpanded && (
            <span
              className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 backdrop-blur-sm
                text-white text-xs font-normal rounded-lg pointer-events-none whitespace-nowrap z-50
                shadow-xl border border-white/10 opacity-0 translate-x-0
                transition-[opacity,transform] duration-150
                group-hover:opacity-100 group-hover:translate-x-1"
            >
              {t("logout")}
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
  const t = useTranslations("admin.sidebar");

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
              aria-label={t("aria.navigationMenu")}
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20
                  text-white/60 hover:text-white transition-all z-10"
                aria-label={t("aria.closeMenu")}
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
