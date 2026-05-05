/* eslint-disable @typescript-eslint/no-explicit-any */
import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {adminLoginUseCase} from "@/infrastructure/container";

// NOTE: Token refresh is handled exclusively by the BFF proxy at
// src/app/api/v1/[...path]/route.ts — NOT here. Doing it in both places
// caused a race condition where NextAuth's session endpoint overwrote the
// BFF's freshly-refreshed cookie with the old expiry, triggering an endless
// refresh loop and eventual 401 → sign-out.

export const authOptions: NextAuthOptions = {
  session: {strategy: "jwt", maxAge: 7 * 24 * 60 * 60}, // session TTL matches refresh token (7 days)
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
        clinicId: {label: "Clinic ID", type: "text"},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const user = await adminLoginUseCase.execute(credentials);
          if (!user) return null;
          return {
            id: user.id,
            email: user.email ?? null,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            clinic_id: (user as any).clinic_id ?? "",
            user_id: user.id,
            backendAccessToken: (user as any).backendAccessToken ?? "",
            backendRefreshToken: (user as any).backendRefreshToken ?? "",
          };
        } catch (err: unknown) {
          const message = (err as Error)?.message ?? "";
          if (message === "AUTH_SERVICE_UNAVAILABLE") return null;
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        // Initial sign-in: embed all claims from authorize() result
        token.role = (user as any).role;
        token.clinic_id = (user as any).clinic_id;
        token.user_id = (user as any).user_id;
        token.backendAccessToken = (user as any).backendAccessToken ?? "";
        token.backendRefreshToken = (user as any).backendRefreshToken ?? "";
        token.backendTokenExpiry = Date.now() + 14 * 60 * 1000; // 14 min
        return token;
      }
      // Pass the token through unchanged.
      // The BFF proxy (app/api/v1/[...path]/route.ts) handles all backend
      // token refreshes and updates this cookie itself via Set-Cookie.
      return token;
    },
    async session({session, token}) {
      if (session.user) {
        session.user.role = token.role;
        session.user.clinic_id = token.clinic_id as string;
        session.user.user_id = token.user_id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/en/admin/login", // default locale; middleware handles locale-aware redirect
  },
};
