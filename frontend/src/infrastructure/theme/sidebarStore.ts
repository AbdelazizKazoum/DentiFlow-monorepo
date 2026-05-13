import {create} from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleSidebar: () => set((state) => ({isCollapsed: !state.isCollapsed})),
  openMobile: () => set({isMobileOpen: true}),
  closeMobile: () => set({isMobileOpen: false}),
}));
