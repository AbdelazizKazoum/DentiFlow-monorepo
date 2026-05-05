// infrastructure/http/axiosClient.ts
// No baseURL — requests use relative paths (e.g. /api/v1/clinics/...) so they
// hit the Next.js BFF proxy at the same origin. The proxy adds the Authorization
// header server-side from the HttpOnly session cookie. The browser never sees the token.

import axios from "axios";

export const axiosClient = axios.create({
  withCredentials: true,
});
