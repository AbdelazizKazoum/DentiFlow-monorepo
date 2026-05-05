/**
 * BFF (Backend-For-Frontend) proxy — /api/v1/[...path]
 *
 * Every browser request to /api/v1/* is handled here, server-side.
 * The backend JWT is read directly from the encrypted next-auth.session-token
 * HttpOnly cookie via getToken(). It is NEVER sent to the browser, satisfying
 * the HttpOnly security requirement even though the API gateway lives on a
 * different origin.
 */
import {NextRequest, NextResponse} from "next/server";
import {getToken} from "next-auth/jwt";

const GATEWAY_URL =
  process.env.API_GATEWAY_INTERNAL_URL ?? "http://localhost:3001";

type RouteContext = {params: Promise<{path: string[]}>};

async function forward(
  req: NextRequest,
  ctx: RouteContext,
): Promise<NextResponse> {
  const {path} = await ctx.params;

  // Read JWT from the HttpOnly next-auth.session-token cookie — never touches the browser
  const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});

  const target = new URL(`/api/v1/${path.join("/")}`, GATEWAY_URL);
  target.search = req.nextUrl.search;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  if (token?.backendAccessToken) {
    headers.set("authorization", `Bearer ${String(token.backendAccessToken)}`);
  }

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  const upstream = await fetch(target.toString(), {
    method: req.method,
    headers,
    ...(body !== undefined && {body}),
  });

  const data = await upstream.arrayBuffer();
  const resHeaders = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) resHeaders.set("content-type", ct);

  return new NextResponse(data, {status: upstream.status, headers: resHeaders});
}

export const GET = (req: NextRequest, ctx: RouteContext) => forward(req, ctx);
export const POST = (req: NextRequest, ctx: RouteContext) => forward(req, ctx);
export const PUT = (req: NextRequest, ctx: RouteContext) => forward(req, ctx);
export const DELETE = (req: NextRequest, ctx: RouteContext) =>
  forward(req, ctx);
export const PATCH = (req: NextRequest, ctx: RouteContext) => forward(req, ctx);
