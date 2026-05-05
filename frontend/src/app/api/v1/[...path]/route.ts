/**
 * BFF (Backend-For-Frontend) proxy — /api/v1/[...path]
 *
 * Handles two concerns in one place (server-side only):
 *
 * 1. AUTH: reads backendAccessToken from the encrypted HttpOnly next-auth.session-token
 *    cookie via getToken(). The token is NEVER sent to the browser.
 *
 * 2. REFRESH: if backendTokenExpiry has passed, calls the API gateway /auth/refresh
 *    endpoint directly (server-to-server), encodes a new NextAuth session JWT, and
 *    writes it back via Set-Cookie in the response so the browser silently gets a
 *    fresh session for future requests — all without any client-side token handling.
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken, encode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

const GATEWAY_URL =
  process.env.API_GATEWAY_INTERNAL_URL ?? "http://localhost:3001";

const SECRET = process.env.NEXTAUTH_SECRET!;

// NextAuth v4 cookie names — mirrors the library's own naming convention
const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

// Must match session.maxAge in nextauth.config.ts (7 days)
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

type RawToken = JWT;

/**
 * If the backend access token has expired, call the refresh endpoint and
 * return the fresh access token + an encoded cookie value to set.
 * Returns null if the refresh token itself is expired/invalid.
 */
async function refreshBackendToken(token: RawToken): Promise<{
  freshAccessToken: string;
  encodedCookie: string;
} | null> {
  const refreshToken = (token as Record<string, unknown>)
    .backendRefreshToken as string | undefined;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      accessToken: string;
      refreshToken?: string;
    };

    const updatedToken: JWT = {
      ...(token as JWT),
      backendAccessToken: data.accessToken,
      backendRefreshToken: data.refreshToken ?? refreshToken,
      backendTokenExpiry: Date.now() + 14 * 60 * 1000,
      error: undefined,
    };

    const encodedCookie = await encode({
      token: updatedToken,
      secret: SECRET,
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return { freshAccessToken: data.accessToken, encodedCookie };
  } catch {
    // Network error or unexpected failure — caller will fall back to the old token
    return null;
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(
  req: NextRequest,
  ctx: RouteContext,
): Promise<NextResponse> {
  const { path } = await ctx.params;

  const token = await getToken({
    req,
    secret: SECRET,
    cookieName: COOKIE_NAME,
  });

  // No session at all — unauthenticated
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: { "X-Auth-Error": "no-session" } },
    );
  }

  // Check if the backend access token needs refreshing
  const expiry = (token as Record<string, unknown>).backendTokenExpiry as
    | number
    | undefined;
  const isExpired = !expiry || Date.now() >= expiry;

  let accessToken = (token as Record<string, unknown>)
    .backendAccessToken as string;
  let refreshedCookie: string | null = null;

  if (isExpired) {
    const refreshed = await refreshBackendToken(token);
    if (refreshed) {
      // Refresh succeeded — use the fresh token and queue the updated cookie
      accessToken = refreshed.freshAccessToken;
      refreshedCookie = refreshed.encodedCookie;
    }
    // If refresh failed (network error, token truly expired, etc.) fall through
    // with the existing accessToken. The gateway will return 401 if the token is
    // truly invalid, and that 401 propagates naturally to the client.
    // This avoids a false sign-out when the refresh endpoint has a transient hiccup
    // but the access token itself still has its 1-minute grace window left.
  }

  // Forward the request to the API gateway
  const target = new URL(`/api/v1/${path.join("/")}`, GATEWAY_URL);
  target.search = req.nextUrl.search;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("authorization", `Bearer ${accessToken}`);

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  const upstream = await fetch(target.toString(), {
    method: req.method,
    headers,
    ...(body !== undefined && { body }),
  });

  const responseData = await upstream.arrayBuffer();
  const resHeaders = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) resHeaders.set("content-type", ct);

  const response = new NextResponse(responseData, {
    status: upstream.status,
    headers: resHeaders,
  });

  // Write the fresh session cookie so the browser has it for subsequent requests
  if (refreshedCookie) {
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set(COOKIE_NAME, refreshedCookie, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  }

  return response;
}

export const GET = (req: NextRequest, ctx: RouteContext) => forward(req, ctx);
export const POST = (req: NextRequest, ctx: RouteContext) => forward(req, ctx);
export const PUT = (req: NextRequest, ctx: RouteContext) => forward(req, ctx);
export const DELETE = (req: NextRequest, ctx: RouteContext) =>
  forward(req, ctx);
export const PATCH = (req: NextRequest, ctx: RouteContext) => forward(req, ctx);
