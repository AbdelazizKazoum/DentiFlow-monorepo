// infrastructure/http/axiosClient.ts
// No baseURL — requests use relative paths (e.g. /api/v1/clinics/...) so they
// hit the Next.js BFF proxy at the same origin. The proxy adds the Authorization
// header server-side from the HttpOnly session cookie. The browser never sees the token.
//
// Token refresh is handled entirely inside the BFF proxy (route.ts) — it checks
// expiry, calls the gateway refresh endpoint server-to-server, and writes a fresh
// next-auth.session-token cookie in the response. No client-side refresh logic needed.

import axios from "axios";
import { signOut } from "next-auth/react";

export const axiosClient = axios.create({
  withCredentials: true,
});

// Only sign out when the BFF itself says there is no valid session
// (X-Auth-Error: no-session). A plain 401 from the backend (e.g. an expired
// access token on an endpoint that the BFF couldn't refresh) should NOT
// immediately sign the user out — the next request will trigger a refresh.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.response.headers["x-auth-error"] === "no-session"
    ) {
      await signOut({ callbackUrl: "/en/admin/login" });
    }
    return Promise.reject(error);
  },
);
