import {withAuth} from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import type {NextRequest} from "next/server";

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

export default withAuth(
  function middleware(req: NextRequest) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized({req, token}) {
        if (ADMIN_ROUTES.test(req.nextUrl.pathname)) {
          return !!token && ALLOWED_ADMIN_ROLES.includes(token.role as string);
        }
        return true; // non-admin routes always pass auth
      },
    },
    pages: {
      signIn: "/en/admin/login", // fallback; locale-aware redirect handled in authorized()
    },
    cookies: {
      sessionToken: {
        name: sessionCookieName,
      },
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
