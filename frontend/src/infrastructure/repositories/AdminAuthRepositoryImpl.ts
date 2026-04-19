// Implements the domain AdminAuthRepository interface.
// Calls the real api-gateway /api/v1/auth endpoints via server-side fetch.

import type {AdminAuthRepository} from "@/domain/auth/repositories/AdminAuthRepository";
import type {
  AdminLoginCredentials,
  AdminRegisterCredentials,
} from "@/domain/auth/entities/AdminUser";
import type {AdminUser} from "@/domain/auth/entities/AdminUser";
import {UserRole} from "@/domain/auth/entities/AdminUser";

interface AuthApiUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  clinic_id: string;
}

interface AuthApiResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthApiUser;
}

export class AdminAuthRepositoryImpl implements AdminAuthRepository {
  async login(credentials: AdminLoginCredentials): Promise<AdminUser | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    let res: Response;
    try {
      res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
    } catch {
      throw new Error("AUTH_SERVICE_UNAVAILABLE");
    }

    if (res.status === 401 || res.status === 403) {
      return null;
    }

    if (!res.ok) {
      throw new Error("AUTH_SERVICE_UNAVAILABLE");
    }

    const body: AuthApiResponse = (await res.json()) as AuthApiResponse;
    const nameParts = (body.user.full_name ?? "").split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    // Return AdminUser with extra properties for the NextAuth jwt callback
    return {
      id: body.user.id,
      firstName,
      lastName,
      email: body.user.email,
      role: body.user.role as UserRole,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({clinic_id: body.user.clinic_id} as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({backendAccessToken: body.accessToken} as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({backendRefreshToken: body.refreshToken} as any),
    };
  }

  async register(
    credentials: AdminRegisterCredentials,
  ): Promise<AdminUser | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    let res: Response;
    try {
      res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          fullName: credentials.fullName,
          role: credentials.role,
        }),
      });
    } catch {
      throw new Error("AUTH_SERVICE_UNAVAILABLE");
    }

    if (res.status === 409) {
      throw new Error("EMAIL_ALREADY_REGISTERED");
    }

    if (res.status === 401 || res.status === 403) {
      return null;
    }

    if (!res.ok) {
      throw new Error("AUTH_SERVICE_UNAVAILABLE");
    }

    const body: AuthApiResponse = (await res.json()) as AuthApiResponse;
    const nameParts = (body.user.full_name ?? "").split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    return {
      id: body.user.id,
      firstName,
      lastName,
      email: body.user.email,
      role: body.user.role as UserRole,
    };
  }
}
