// infrastructure/http/axiosClient.ts
// No baseURL — requests use relative paths (e.g. /api/v1/clinics/...) so they
// hit the Next.js BFF proxy at the same origin. The proxy adds the Authorization
// header server-side from the HttpOnly session cookie. The browser never sees the token.
//
// Token refresh is handled entirely inside the BFF proxy (route.ts) — it checks
// expiry, calls the gateway refresh endpoint server-to-server, and writes a fresh
// next-auth.session-token cookie in the response. No client-side refresh logic needed.

import axios from "axios";
import {signOut} from "next-auth/react";

export const axiosClient = axios.create({
  withCredentials: true,
});

// If the BFF returns 401 it means the refresh token itself has expired and the
// session is unrecoverable. Sign out and redirect to login.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await signOut({callbackUrl: "/en/admin/login"});
    }
    return Promise.reject(error);
  },
);
