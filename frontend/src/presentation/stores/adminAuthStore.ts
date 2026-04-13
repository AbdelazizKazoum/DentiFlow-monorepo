import {create} from "zustand";
import {persist} from "zustand/middleware";
import type {
  AdminAuthState,
  AdminLoginCredentials,
} from "@/domain/auth/entities";
import {
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_PASSWORD,
} from "@/application/auth/adminAuthMockData";

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      mockLogin: (credentials: AdminLoginCredentials): boolean => {
        if (credentials.password !== MOCK_ADMIN_PASSWORD) return false;
        const user = MOCK_ADMIN_USERS.find(
          (u) => u.email === credentials.email,
        );
        if (!user) return false;
        set({isAuthenticated: true, currentUser: user});
        return true;
      },
      mockLogout: () => set({isAuthenticated: false, currentUser: null}),
    }),
    {name: "admin-auth-storage"},
  ),
);
