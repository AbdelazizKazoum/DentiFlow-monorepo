import {create} from "zustand";
import {persist} from "zustand/middleware";
import type {AdminUser} from "@/domain/auth/entities/AdminUser";
import type {AdminLoginCredentials} from "@/domain/auth/entities/AdminUser";
import {adminLoginUseCase} from "@/infrastructure/container";

interface AdminAuthStoreState {
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  login: (credentials: AdminLoginCredentials) => Promise<boolean>;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthStoreState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      login: async (credentials: AdminLoginCredentials): Promise<boolean> => {
        const user = await adminLoginUseCase.execute(credentials);
        if (!user) return false;
        set({isAuthenticated: true, currentUser: user});
        return true;
      },
      logout: () => set({isAuthenticated: false, currentUser: null}),
    }),
    {name: "admin-auth-storage"},
  ),
);
