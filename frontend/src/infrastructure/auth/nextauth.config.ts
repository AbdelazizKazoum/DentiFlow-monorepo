/* eslint-disable @typescript-eslint/no-explicit-any */
import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {adminLoginUseCase} from "@/infrastructure/container";

export const authOptions: NextAuthOptions = {
  session: {strategy: "jwt", maxAge: 15 * 60}, // 15-minute access token
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await adminLoginUseCase.execute({
          email: credentials.email,
          password: credentials.password,
        });
        if (!user) return null;
        // Shape NextAuth expects: must include `id`
        return {
          id: user.id,
          email: user.email ?? null,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          clinic_id: "clinic-001", // Placeholder — real clinic_id from auth-service in Epic 8
          user_id: user.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        // First sign-in: embed claims from authorize() result
        token.role = (user as any).role;
        token.clinic_id = (user as any).clinic_id;
        token.user_id = (user as any).user_id;
      }
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
