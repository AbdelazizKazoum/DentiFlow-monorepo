import type {DefaultSession, DefaultJWT} from "next-auth";

export type UserRole =
  | "patient"
  | "secretariat"
  | "dental_assistant"
  | "doctor"
  | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      user_id: string;
      role: UserRole;
      clinic_id: string;
    } & DefaultSession["user"];
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user_id: string;
    role: UserRole;
    clinic_id: string;
    backendAccessToken: string;
    backendRefreshToken: string;
    backendTokenExpiry: number;
    error?: "RefreshAccessTokenError";
  }
}
