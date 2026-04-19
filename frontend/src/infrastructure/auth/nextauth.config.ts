/* eslint-disable @typescript-eslint/no-explicit-any */
import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {adminLoginUseCase} from "@/infrastructure/container";

async function refreshBackendToken(token: any) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
      {
        method: "POST",
        headers: {Authorization: `Bearer ${token.backendRefreshToken}`},
      },
    );
    if (!res.ok) throw new Error("RefreshFailed");
    const data = (await res.json()) as {
      accessToken: string;
      refreshToken?: string;
    };
    return {
      ...token,
      backendAccessToken: data.accessToken,
      backendRefreshToken: data.refreshToken ?? token.backendRefreshToken,
      backendTokenExpiry: Date.now() + 14 * 60 * 1000,
      error: undefined,
    };
  } catch {
    return {...token, error: "RefreshAccessTokenError" as const};
  }
}

export const authOptions: NextAuthOptions = {
  session: {strategy: "jwt", maxAge: 7 * 24 * 60 * 60}, // session TTL matches refresh token (7 days)
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const user = await adminLoginUseCase.execute({
            email: credentials.email,
            password: credentials.password,
          });
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
      // Subsequent requests: return token if access token still valid
      if (Date.now() < (token.backendTokenExpiry as number)) return token;
      // Access token expired — refresh
      return refreshBackendToken(token);
    },
    async session({session, token}) {
      if (session.user) {
        session.user.role = token.role;
        session.user.clinic_id = token.clinic_id as string;
        session.user.user_id = token.user_id as string;
      }
      if (token.error) {
        (session as any).error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: "/en/admin/login", // default locale; middleware handles locale-aware redirect
  },
};
