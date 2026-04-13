# Story 1.1: Implement JWT Authentication with Role-Based Access

Status: ready-for-dev

## Story

As the system,
I want JWT-based auth with role claims (Patient, Secretariat, Dental Assistant, Doctor, Admin) and refresh tokens,
so that users are securely authenticated with appropriate permissions enforced across all routes.

## Acceptance Criteria

1. **Given** `POST /api/v1/auth/login` endpoint (mocked via CredentialsProvider), **When** user submits valid email/password, **Then** NextAuth v4 issues a JWT session with `user_id`, `role`, `clinic_id`, and `exp` claims.
2. **Given** a valid session JWT, **When** it reaches the access-token TTL (15 minutes), **Then** the refresh token rotation mechanism transparently renews the access token without requiring re-login.
3. **Given** Next.js middleware, **When** a request hits any `/(ar|en|fr)/admin/*` route, **Then** the middleware checks NextAuth session and redirects to `/(locale)/admin/login` if unauthenticated.
4. **Given** a user with `role: "patient"`, **When** they attempt to access `/(locale)/admin/dashboard`, **Then** they receive a 403-equivalent redirect to the unauthorized page or login.
5. **Given** the TypeScript project, **When** `next-auth` types are augmented, **Then** `session.user.role`, `session.user.clinic_id`, and `session.user.user_id` are type-safe throughout the codebase.
6. **Given** the existing `AdminLoginForm`, **When** user submits credentials, **Then** the form calls `signIn("credentials", ...)` from NextAuth instead of the Zustand mock store directly.
7. **Given** the admin dashboard, **When** a user logs out, **Then** `signOut()` clears the NextAuth session and redirects to `/(locale)/admin/login`.
8. **Given** the locale-routed middleware, **When** unauthenticated requests arrive, **Then** i18n locale detection (next-intl) still functions correctly alongside the auth guard.

## Tasks / Subtasks

- [ ] Task 1: Install `next-auth@^4.24.11` (AC: 1, 2, 5)
  - [ ] Run `pnpm add next-auth@^4.24.11` inside `frontend/`
  - [ ] Verify it appears in `frontend/package.json` dependencies

- [ ] Task 2: Create NextAuth configuration (AC: 1, 2, 5)
  - [ ] Create `frontend/src/infrastructure/auth/nextauth.config.ts` with:
    - `CredentialsProvider` that validates against `AdminAuthRepositoryImpl` (existing mock — API URL stubbed)
    - JWT session strategy
    - `jwt` callback: embeds `user_id`, `role`, `clinic_id` from credentials into the JWT token
    - `session` callback: maps JWT claims to `session.user` object
    - Access token TTL of 15 minutes (`maxAge: 15 * 60`)
    - Refresh token rotation via `jwt` callback TTL check

- [ ] Task 3: Create NextAuth TypeScript type augmentation (AC: 5)
  - [ ] Create `frontend/src/infrastructure/auth/next-auth.d.ts` (module augmentation for `next-auth`)
  - [ ] Extend `Session.user` with `user_id: string`, `role: UserRole`, `clinic_id: string`
  - [ ] Extend `JWT` with same fields
  - [ ] Export/define `UserRole` type: `"patient" | "secretariat" | "dental_assistant" | "doctor" | "admin"`

- [ ] Task 4: Create NextAuth API route handler (AC: 1, 6)
  - [ ] Create `frontend/src/app/api/auth/[...nextauth]/route.ts`
  - [ ] Export `{ GET, POST }` handlers using `NextAuth(authOptions)` from `nextauth.config.ts`

- [ ] Task 5: Update domain entity to include all roles (AC: 1, 4)
  - [ ] Update `frontend/src/domain/auth/entities/AdminUser.ts`:
    - Expand `role` union from `"admin" | "doctor" | "secretariat"` to include `"patient" | "dental_assistant"`
    - Export `UserRole` type alias for the full union

- [ ] Task 6: Update middleware to enforce auth + i18n (AC: 3, 4, 8)
  - [ ] Replace `frontend/src/middleware.ts` content:
    - Chain `next-auth/middleware` (`withAuth`) over the existing `next-intl` middleware
    - Admin routes (`/(ar|en|fr)/admin/:path*` except `/admin/login`) require session
    - Redirect unauthenticated users to `/${locale}/admin/login`
    - Role guard: `admin`, `doctor`, `secretariat`, `dental_assistant` can access admin routes; `patient` cannot
    - i18n locale matching still applies to all routes via `next-intl`

- [ ] Task 7: Update `AdminLoginForm` to use NextAuth `signIn` (AC: 6)
  - [ ] Update `frontend/src/presentation/admin/auth/components/AdminLoginForm.tsx`
  - [ ] Replace the `useAdminAuthStore().login(...)` call with `signIn("credentials", { email, password, redirect: false })`
  - [ ] Handle the `CallbackUrl` and NextAuth error response (`CredentialsSignin`)
  - [ ] Remove direct Zustand mock store dependency from the component

- [ ] Task 8: Update `adminAuthStore` to derive state from NextAuth session (AC: 6, 7)
  - [ ] Update `frontend/src/presentation/stores/adminAuthStore.ts`
  - [ ] Use `useSession()` from `next-auth/react` as the session source of truth
  - [ ] Keep `login(credentials)` method as a thin wrapper over `signIn("credentials", ...)`
  - [ ] `logout()` calls `signOut({ callbackUrl: "/${locale}/admin/login" })` from NextAuth

- [ ] Task 9: Wrap the App Router root with `SessionProvider` (AC: 6, 7)
  - [ ] Create or update `frontend/src/app/[locale]/layout.tsx` to wrap children in `<SessionProvider>` from `next-auth/react`
  - [ ] Ensure `SessionProvider` is a `"use client"` wrapper component (create separate `Providers.tsx` if needed)

- [ ] Task 10: Write unit tests (AC: 1, 3, 4, 5)
  - [ ] Create `frontend/src/infrastructure/auth/__tests__/nextauth.config.test.ts`
    - Test CredentialsProvider `authorize()` function: valid credentials → returns user with role, clinic_id; invalid → null
    - Test `jwt` callback: token enriched with user_id, role, clinic_id on sign-in
    - Test `session` callback: session.user has correct shape

## Dev Notes

### Critical Architecture Constraints (DO NOT VIOLATE)

1. **NextAuth version: `next-auth@4.x` only.** The architecture specifies "NextAuth v4 (Auth.js v4)". Do NOT install `next-auth@5.x` or `@auth/nextjs` — API is completely different. `next-auth@4` is the stable production package. Compatible with Next.js App Router since `4.22+`.

2. **Route handler pattern for App Router (next-auth v4):**

   ```ts
   // src/app/api/auth/[...nextauth]/route.ts
   import NextAuth from "next-auth";
   import {authOptions} from "@/infrastructure/auth/nextauth.config";
   const handler = NextAuth(authOptions);
   export {handler as GET, handler as POST};
   ```

3. **Session strategy MUST be `"jwt"`.** Do NOT use the database session strategy. JWT is required for stateless auth across microservices. [Source: docs/planning-artifacts/architecture.md#Authentication--Security]

4. **JWT payload MUST include `{ user_id, clinic_id, role, iat, exp }`.** These are the standard claims consumed by the API Gateway. When auth-service is live, these will be returned directly from the backend JWT. [Source: docs/planning-artifacts/architecture.md#Authentication--Security]

5. **clinic_id is from JWT claim — NEVER inferred from URL.** The `clinic_id` on `session.user` is the authoritative scope. [Source: docs/planning-artifacts/architecture.md#Pre-Architecture Locked Decisions - clinic_id Scoping Strategy]

6. **Middleware chain order: auth guard FIRST, then i18n.** Use `withAuth` from `next-auth/middleware` to wrap the i18n createMiddleware. The `authorized` callback checks session role. The i18n middleware continues to handle locale routing.

7. **RTL-safe CSS only:** All new UI code must use Tailwind logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `gap-*`). NEVER use physical direction utilities (`pl-*`, `pr-*`, `ml-*`, `mr-*`, `space-x-*`). [Source: docs/planning-artifacts/architecture.md#Pre-Architecture Locked Decisions - RTL/LTR Strategy]

8. **Clean Architecture layering — NextAuth config lives in infrastructure:**
   - `infrastructure/auth/nextauth.config.ts` — NextAuth `AuthOptions` (CredentialsProvider, callbacks)
   - `infrastructure/auth/next-auth.d.ts` — TypeScript type augmentations
   - `app/api/auth/[...nextauth]/route.ts` — Next.js route handler (adapter only, no logic)
   - `presentation/stores/adminAuthStore.ts` — Zustand store using `useSession()`; DOES NOT call APIs directly
   - `presentation/components/` — React components call store only, use `signIn`/`signOut` from `next-auth/react`

9. **No direct API calls in stores or components.** The `AdminAuthRepositoryImpl` in infrastructure calls the backend. The store wraps `signIn()` from NextAuth. Components call the store. [Source: docs/planning-artifacts/architecture.md#Frontend Clean Architecture]

10. **Admin login page remains at `src/app/[locale]/admin/login/page.tsx`** — outside the `(dashboard)` route group. The route group restructuring from Story 0.5 MUST NOT be reverted.

### Project Structure Notes

**Existing files to modify:**

- `frontend/src/domain/auth/entities/AdminUser.ts` — add `"patient"` and `"dental_assistant"` to role union
- `frontend/src/middleware.ts` — replace with `withAuth` + next-intl chain
- `frontend/src/presentation/stores/adminAuthStore.ts` — update to use NextAuth session
- `frontend/src/presentation/admin/auth/components/AdminLoginForm.tsx` — replace store.login() with signIn()

**Files to create (new):**

- `frontend/src/app/api/auth/[...nextauth]/route.ts` — NextAuth App Router handler
- `frontend/src/infrastructure/auth/nextauth.config.ts` — AuthOptions (CredentialsProvider, JWT callbacks)
- `frontend/src/infrastructure/auth/next-auth.d.ts` — Session/JWT type augmentations
- `frontend/src/infrastructure/auth/__tests__/nextauth.config.test.ts` — Unit tests for auth callbacks
- `frontend/src/app/[locale]/providers.tsx` — Client `SessionProvider` wrapper (if not already `"use client"` in layout)

**Existing infrastructure to reuse:**

- `frontend/src/infrastructure/repositories/AdminAuthRepositoryImpl.ts` — already implements `AdminAuthRepository.login()` with mock data; the NextAuth CredentialsProvider will call this directly
- `frontend/src/domain/auth/repositories/AdminAuthRepository.ts` — existing interface; unchanged
- `frontend/src/infrastructure/container/index.ts` — exports `adminLoginUseCase`; CredentialsProvider can use this

**Backend dependency status**: `auth-service` (Epic 8, Story 8.3) is in `ready-for-dev` and not yet implemented. For this story, the CredentialsProvider calls `adminLoginUseCase.execute(credentials)` from the existing mock infrastructure. When auth-service is live, the repository implementation is swapped to call `POST /api/v1/auth/login`; the NextAuth config and callbacks remain unchanged.

**Monorepo root layout** (`pnpm-workspace.yaml` governs packages):

```
dentiflow/
  frontend/            ← This story's scope
  services/            ← Epic 8 scope (auth-service etc.)
  packages/            ← shared-db, shared-logger, shared-config (Epic 8)
```

### Middleware Design Pattern

The combined middleware chains `withAuth` over next-intl. Here is the required pattern:

```ts
// src/middleware.ts
import {withAuth} from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

const ADMIN_ROUTES = /^\/(ar|en|fr)\/admin(?!\/(login))(\/.*)?$/;
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
  },
);

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

> **Note:** The `authorized` callback returns `false` to trigger NextAuth's redirect to `pages.signIn`. For proper locale-aware redirect, read `req.nextUrl.pathname` locale segment and build the redirect URL dynamically in the `middleware` function before returning intlMiddleware.

### NextAuth Config Pattern

```ts
// src/infrastructure/auth/nextauth.config.ts
import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {adminLoginUseCase} from "@/infrastructure/container";

export const authOptions: NextAuthOptions = {
  session: {strategy: "jwt", maxAge: 15 * 60}, // 15-minute access token
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await adminLoginUseCase.execute({
          email: credentials.email,
          password: credentials.password,
        });
        if (!user) return null;
        // Shape NextAuth expects: must include `id`
        return {
          id: user.id,
          email: user.email ?? null, // NextAuth default field
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          clinic_id: "clinic-001", // Placeholder — real clinic_id from auth-service in Epic 8
          user_id: user.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({token, user}) {
      if (user) {
        // First sign-in: embed claims from authorize() result
        token.role = (user as any).role;
        token.clinic_id = (user as any).clinic_id;
        token.user_id = (user as any).user_id;
      }
      return token;
    },
    async session({session, token}) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.clinic_id = token.clinic_id as string;
        session.user.user_id = token.user_id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/en/admin/login", // default locale; middleware handles locale-aware redirect
  },
};
```

### Type Augmentation Pattern

```ts
// src/infrastructure/auth/next-auth.d.ts
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
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user_id: string;
    role: UserRole;
    clinic_id: string;
  }
}
```

### Library & Framework Requirements

| Library           | Version / Constraint     | Usage                                                  | Notes                            |
| ----------------- | ------------------------ | ------------------------------------------------------ | -------------------------------- |
| `next-auth`       | `^4.24.11`               | Session JWT strategy, CredentialsProvider              | v4 ONLY — not v5/Auth.js         |
| `next-intl`       | `^4.9.0` (installed)     | i18n locale routing in middleware                      | Existing; no version change      |
| `next`            | `16.2.3` (installed)     | App Router, route handlers                             | No update needed                 |
| `zustand`         | `^5.0.12` (installed)    | `adminAuthStore` session state                         | Existing; wraps NextAuth session |
| `next-auth/react` | (bundled with next-auth) | `useSession`, `signIn`, `signOut` in client components | No separate install              |

**Do NOT install:**

- `@auth/nextjs` — this is NextAuth v5 / Auth.js v5 (incompatible API)
- `jose` or `jsonwebtoken` manually for JWT — NextAuth v4 handles JWT internally
- `iron-session` — not needed; NextAuth uses built-in JWT

### Testing Requirements

**Test file**: `frontend/src/infrastructure/auth/__tests__/nextauth.config.test.ts`

```ts
import {authOptions} from "../nextauth.config";
import type {Credentials} from "next-auth/providers/credentials";

// Mock the use case
jest.mock("@/infrastructure/container", () => ({
  adminLoginUseCase: {
    execute: jest.fn(),
  },
}));

import {adminLoginUseCase} from "@/infrastructure/container";
const mockExecute = adminLoginUseCase.execute as jest.Mock;

describe("NextAuth CredentialsProvider authorize()", () => {
  const credentialsProvider = authOptions.providers[0] as any;
  const authorize = credentialsProvider.authorize;

  it("returns null when credentials are missing", async () => {
    expect(await authorize(null, {} as any)).toBeNull();
    expect(await authorize({email: "", password: ""}, {} as any)).toBeNull();
  });

  it("returns null when use case returns null (invalid credentials)", async () => {
    mockExecute.mockResolvedValue(null);
    const result = await authorize(
      {email: "x@x.com", password: "wrong"},
      {} as any,
    );
    expect(result).toBeNull();
  });

  it("returns user object with required claims when credentials are valid", async () => {
    mockExecute.mockResolvedValue({
      id: "u1",
      firstName: "Amine",
      lastName: "Admin",
      email: "admin@dentiflow.com",
      role: "admin",
    });
    const result = await authorize(
      {email: "admin@dentiflow.com", password: "admin123"},
      {} as any,
    );
    expect(result).toMatchObject({
      id: "u1",
      role: "admin",
      user_id: "u1",
      clinic_id: expect.any(String),
    });
  });
});

describe("NextAuth jwt() callback", () => {
  const jwtCallback = authOptions.callbacks!.jwt!;

  it("embeds claims from user on first sign-in", async () => {
    const token = {sub: "u1"} as any;
    const user = {
      id: "u1",
      role: "doctor",
      clinic_id: "clinic-001",
      user_id: "u1",
    };
    const result = await jwtCallback({
      token,
      user,
      account: null,
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    });
    expect(result.role).toBe("doctor");
    expect(result.clinic_id).toBe("clinic-001");
    expect(result.user_id).toBe("u1");
  });

  it("passes token through unchanged on subsequent calls (no user)", async () => {
    const token = {
      sub: "u1",
      role: "admin",
      clinic_id: "clinic-001",
      user_id: "u1",
    } as any;
    const result = await jwtCallback({
      token,
      user: undefined as any,
      account: null,
      profile: undefined,
      trigger: "update",
      isNewUser: false,
      session: undefined,
    });
    expect(result.role).toBe("admin");
  });
});

describe("NextAuth session() callback", () => {
  const sessionCallback = authOptions.callbacks!.session!;

  it("maps JWT claims to session.user", async () => {
    const session = {
      user: {name: "Amine", email: "a@a.com"},
      expires: "",
    } as any;
    const token = {
      role: "secretariat",
      clinic_id: "clinic-001",
      user_id: "u2",
    } as any;
    const result = await sessionCallback({
      session,
      token,
      user: undefined as any,
      newSession: undefined,
      trigger: "update",
    });
    expect(result.user.role).toBe("secretariat");
    expect(result.user.clinic_id).toBe("clinic-001");
    expect(result.user.user_id).toBe("u2");
  });
});
```

**Mock NextAuth in existing tests:**

The existing test `frontend/src/presentation/admin/auth/__tests__/AdminLoginPage.test.tsx` currently mocks the Zustand store. After story 1.1, add this to the top of the test file:

```ts
jest.mock("next-auth/react", () => ({
  useSession: () => ({data: null, status: "unauthenticated"}),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({children}: {children: React.ReactNode}) => children,
}));
```

### Previous Story Intelligence

The most recent story was **Story 0.5: Create Admin Login Page** (status: review).

**Key patterns established to reuse:**

- File naming: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Zustand store pattern (persist middleware): `frontend/src/presentation/stores/adminAuthStore.ts` — this store MUST be updated; do NOT create a second auth store
- Clean Architecture wiring: `infrastructure/container/index.ts` is the single DI wiring point
- Repository pattern: `AdminAuthRepositoryImpl` implements `AdminAuthRepository` interface from domain
- The `AdminLoginForm` currently calls `useAdminAuthStore().login(credentials)` — **Task 7 replaces this call** with `signIn("credentials", ...)`
- Route groups: `admin/(dashboard)/layout.tsx` contains the sidebar; `admin/login/page.tsx` is outside it — do NOT break this structure
- i18n keys for admin auth are in `shared/messages/{en,fr,ar}.json` under `admin.auth` namespace

**Regression risk:** The `adminAuthStore` is used in `AdminLoginForm.tsx` and potentially the admin header/user dropdown. After replacing with NextAuth session, ensure:

1. Any component using `useAdminAuthStore().isAuthenticated` is updated to use `useSession().status === "authenticated"`
2. Logout buttons calling `store.logout()` must call NextAuth `signOut()` instead (or have `logout()` delegate to `signOut()`)

**Files to scan before implementing:**

- `frontend/src/presentation/admin/auth/components/AdminLoginForm.tsx`
- `frontend/src/app/[locale]/admin/(dashboard)/layout.tsx` — check for any auth guard logic already present
- `frontend/src/app/[locale]/layout.tsx` — must add `SessionProvider` here

### Git Intelligence Summary

Recent commits (last 5):

- `dd300cb` — feat: refactor authentication flow by implementing AdminLogin use case and repository pattern
  - Introduces: `AdminAuthRepositoryImpl`, `AdminLogin` use case, `AdminAuthRepository` interface, updated `adminAuthStore` with use case pattern, updated `container/index.ts`
  - Pattern: repository interface in domain, implementation in infrastructure, DI via container
  - **This is the foundation Story 1.1 extends** — replace mock with NextAuth without changing the repository interface or use case

- `7de6ff9` — feat: update test files for AdminLoginPage
- `e865216` — Refactor code structure
- `9ae4262` — feat: update sidebar button styles
- `8ca5e40` — feat: enhance sidebar functionality

**Most important pattern to follow (from dd300cb):**
The `authorize()` function in NextAuth CredentialsProvider should call `adminLoginUseCase.execute(credentials)` — exactly how the Zustand store currently calls it. This preserves the Clean Architecture wiring.

### Project Context Reference

[Source: docs/planning-artifacts/project-context.md]
[Source: docs/planning-artifacts/architecture.md#Authentication--Security]
[Source: docs/planning-artifacts/architecture.md#Frontend Architecture]
[Source: docs/planning-artifacts/epics.md#Epic 1: Platform Foundation]

**Tech stack summary:**

- Next.js 16.2.3 with App Router + TypeScript
- Zustand v5 for client state management
- next-intl v4.9 for i18n
- Clean Architecture: domain → application → infrastructure → presentation
- MUI v9 + Tailwind v4 for styling (RTL/LTR dual Emotion cache pattern)

**Security requirements to enforce:**

- NFR4: Zero unauthorized cross-role data access (API-enforced RBAC) — this story implements the frontend half
- JWT expiry/rotation, TLS enforced — access token 15min, refresh token rotated on every use
- clinic_id always from JWT token, never from URL or request header

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

### File List
