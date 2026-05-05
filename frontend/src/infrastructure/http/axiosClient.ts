// infrastructure/http/axiosClient.ts
// No baseURL — requests use relative paths (e.g. /api/v1/clinics/...) so they
// hit the Next.js BFF proxy at the same origin. The proxy adds the Authorization
// header server-side from the HttpOnly session cookie. The browser never sees the token.

import axios from "axios";
import {getSession, signOut} from "next-auth/react";

export const axiosClient = axios.create({
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// 401 retry interceptor — secure token refresh without exposing the backend JWT
//
// Flow when the backend access token expires:
//   1. BFF proxy forwards the stale token → API gateway returns 401
//   2. This interceptor catches the 401
//   3. getSession() hits /api/auth/session server-side → triggers the NextAuth
//      jwt callback → refreshBackendToken() runs → writes a fresh
//      backendAccessToken into the encrypted HttpOnly next-auth.session-token cookie
//   4. Retry the original request — BFF proxy reads the fresh token via getToken()
//   5. If refresh fails (refresh token also expired) → sign out and redirect to login
//
// Queue pattern: if multiple requests fail with 401 simultaneously, only one
// refresh call goes out; the rest wait and then retry.
// ---------------------------------------------------------------------------

type QueueEntry = {resolve: () => void; reject: (err: unknown) => void};

let isRefreshing = false;
let queue: QueueEntry[] = [];

function drainQueue(error: unknown) {
  queue.forEach(({resolve, reject}) => (error ? reject(error) : resolve()));
  queue = [];
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    // Only intercept 401s that haven't already been retried
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise<void>((resolve, reject) =>
        queue.push({resolve, reject}),
      ).then(() => axiosClient(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Triggers the NextAuth jwt callback which calls refreshBackendToken().
      // On success NextAuth writes the fresh token into the HttpOnly cookie.
      const session = await getSession();

      if (!session) {
        // Refresh token also expired — force logout
        drainQueue(error);
        await signOut({callbackUrl: "/en/admin/login"});
        return Promise.reject(error);
      }

      drainQueue(null);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      drainQueue(refreshError);
      await signOut({callbackUrl: "/en/admin/login"});
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
