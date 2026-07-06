import createIntlMiddleware from "next-intl/middleware";
import {NextResponse, type NextRequest} from "next/server";
import {getToken} from "next-auth/jwt";

const ADMIN_ROUTES = /^\/(ar|en|fr)\/admin(?!\/(login|register))(\/.*)?$/;
const ALLOWED_ADMIN_ROLES = [
  "admin",
  "doctor",
  "secretariat",
  "dental_assistant",
];

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "fr", "ar"],
  defaultLocale: "en",
});

const sessionCookieName =
  process.env.NEXTAUTH_SESSION_COOKIE_NAME ?? "dentiflow-prod.session-token";

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (ADMIN_ROUTES.test(pathname)) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: sessionCookieName,
    });

    if (!token || !ALLOWED_ADMIN_ROLES.includes(token.role as string)) {
      const locale = pathname.split("/")[1] || "en";
      const loginUrl = new URL(`/${locale}/admin/login`, req.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        `${pathname}${req.nextUrl.search}`,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
