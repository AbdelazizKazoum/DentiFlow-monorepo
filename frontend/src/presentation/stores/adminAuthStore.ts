import {create} from "zustand";
import {signIn, signOut} from "next-auth/react";
import type {AdminLoginCredentials} from "@/domain/auth/entities/AdminUser";

interface AdminAuthStoreState {
  login: (credentials: AdminLoginCredentials) => Promise<boolean>;
  logout: (locale?: string) => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthStoreState>()(() => ({
  login: async (credentials: AdminLoginCredentials): Promise<boolean> => {
    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });
    return !!result?.ok && !result.error;
  },
  logout: async (locale = "en"): Promise<void> => {
    await signOut({callbackUrl: `/${locale}/admin/login`});
  },
}));

