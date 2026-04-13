# Story 0.5: Create Admin Login Page

Status: review

> **Scope note:** This story covers the **admin login page only**. Patient login and patient registration pages are deferred to a later story.

## Story

As an admin or staff member,
I want a secure, professional-looking admin login page with a split-panel design,
so that I can authenticate into the admin dashboard with a polished, trustworthy experience.

## Acceptance Criteria

1. **Given** I navigate to `/[locale]/admin/login` **Then** I see a full-screen split-panel login page: a dark branded left panel and a white/light right panel containing the login form, with no sidebar or dashboard header visible.
2. **Given** the login form **When** I submit with an empty email or empty password **Then** inline validation error messages appear beneath each field without a full page reload.
3. **Given** the login form **When** I submit valid mock credentials (any email + password `"admin123"`) **Then** the button shows a loading spinner with "Authenticating…" text, then a green success message appears and the user is redirected to `/[locale]/admin/dashboard`.
4. **Given** the login form **When** I submit with an incorrect password (anything other than `"admin123"`) **Then** a red error banner appears beneath the form reading "Invalid credentials. Please try again."
5. **Given** the password field **When** I click the eye toggle icon **Then** the password toggles between masked (`••••••••`) and visible text.
6. **Given** the page loads **Then** animated floating blobs (DentiFlow blue `#1e56d0` + a lighter accent) pulse in the background using Framer Motion, and the login card fades in from below on mount.
7. **Given** any viewport width **When** on mobile (≤ 768px) **Then** the left branding panel is hidden and the right form panel fills the full screen with proper padding.
8. **Given** the active locale is Arabic (`ar`) **Then** form direction is RTL — all directional spacing uses Tailwind logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`), no physical classes (`pl-*`, `pr-*`, `ml-*`, `mr-*`).
9. **Given** the admin login page **Then** it does NOT inherit the admin sidebar/header layout (`admin/(dashboard)/layout.tsx`); it renders as a standalone full-screen page.

## Tasks / Subtasks

- [x] Task 1: Install react-hook-form dependency (AC: 2, 3, 4)
  - [x] Run `pnpm add react-hook-form` inside `frontend/`
  - [x] Verify it appears in `frontend/package.json` dependencies

- [x] Task 2: Restructure admin routing with route group (AC: 9)
  - [x] Create `frontend/src/app/[locale]/admin/(dashboard)/` folder (route group — no URL impact)
  - [x] Move `frontend/src/app/[locale]/admin/layout.tsx` → `frontend/src/app/[locale]/admin/(dashboard)/layout.tsx`
  - [x] Move `frontend/src/app/[locale]/admin/dashboard/page.tsx` → `frontend/src/app/[locale]/admin/(dashboard)/dashboard/page.tsx`
  - [x] Verify `admin/dashboard` URL still works after move

- [x] Task 3: Create domain entities for admin auth (AC: 3, 4)
  - [x] Create `frontend/src/domain/auth/entities.ts` with `AdminLoginCredentials`, `AdminUser`, `AdminAuthState` interfaces

- [x] Task 4: Create mock data and Zustand auth store (AC: 3, 4)
  - [x] Create `frontend/src/application/auth/adminAuthMockData.ts` with mock admin users array
  - [x] Create `frontend/src/infrastructure/stores/adminAuthStore.ts` using Zustand + persist (pattern from `themeStore.ts`)

- [x] Task 5: Create admin login use case (AC: 3, 4)
  - [x] Create `frontend/src/application/useCases/auth/mockAdminLogin.ts` — validates credentials against mock data, returns `{ success: boolean; user?: AdminUser }`

- [x] Task 6: Build presentation components (AC: 1, 5, 6, 7, 8)
  - [x] Create `frontend/src/presentation/admin/auth/components/AnimatedBlobs.tsx` — Framer Motion floating blobs background
  - [x] Create `frontend/src/presentation/admin/auth/components/BrandingPanel.tsx` — dark left panel (logo, tagline, stats widget)
  - [x] Create `frontend/src/presentation/admin/auth/components/AdminLoginForm.tsx` — react-hook-form form with email, password (show/hide), remember me, submit button
  - [x] Create `frontend/src/presentation/admin/auth/AdminLoginPage.tsx` — composes full-screen split layout

- [x] Task 7: Create Next.js page route (AC: 1, 9)
  - [x] Create `frontend/src/app/[locale]/admin/login/page.tsx` — server component with metadata, renders `<AdminLoginPage />`

- [x] Task 8: Add i18n translation keys (AC: 8)
  - [x] Add `admin.auth` keys to `frontend/src/shared/messages/en.json`
  - [x] Add `admin.auth` keys to `frontend/src/shared/messages/fr.json`
  - [x] Add `admin.auth` keys to `frontend/src/shared/messages/ar.json`

- [x] Task 9: Write unit tests (AC: 1–5)
  - [x] Create `frontend/src/presentation/admin/auth/__tests__/AdminLoginPage.test.tsx`

## Dev Notes

### Critical Architecture Constraints (DO NOT VIOLATE)

1. **Route group restructuring is required (Task 2 FIRST)**: The current `admin/layout.tsx` applies to ALL routes under `/admin/`. The login page must NOT inherit the sidebar/header layout. Solve this with a Next.js route group: move layout + dashboard into `admin/(dashboard)/`. Route groups use parentheses in the folder name — they do NOT change the URL. `/admin/dashboard` stays the same.

2. **Admin login page location**: `frontend/src/app/[locale]/admin/login/page.tsx` — outside the `(dashboard)` group, so it gets no sidebar. Do NOT put it inside `auth/` or any other folder.

3. **Locale-routed pages ONLY**: Pages MUST be under `[locale]/`. The middleware (`frontend/src/middleware.ts`) only matches `/(ar|en|fr)/:path*`.

4. **RTL-safe CSS only**: Use Tailwind logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `gap-*`). NEVER use `pl-*`, `pr-*`, `ml-*`, `mr-*`, `space-x-*`.

5. **No real authentication**: Epic 0 is UI/mock only. Do NOT call API endpoints. Use Zustand mock store only.

6. **Clean Architecture layering**:
   - `domain/auth/` → pure TypeScript interfaces (no imports from React, Zustand, etc.)
   - `application/auth/` → mock data only (no React)
   - `application/useCases/auth/` → use cases calling the store
   - `infrastructure/stores/adminAuthStore.ts` → Zustand store
   - `presentation/admin/auth/` → React components (`"use client"`)
   - `app/[locale]/admin/login/page.tsx` → Next.js server component (no `"use client"`)

7. **CSS tokens from `globals.css`** — use these existing Tailwind utilities for consistency with the rest of the admin UI:
   - `bg-page` → page background (`#f8faff` light / `#1a2035` dark)
   - `bg-card` → card background (`#ffffff` light / `#222b44` dark)
   - `bg-primary` → brand blue `#1e56d0`
   - `border-ui-border` → subtle border
   - Poppins font is used in admin (injected in admin layout — inject it similarly in the login page itself via `useEffect`)

---

### Design Specification (from provided HTML reference, adapted to DentiFlow theme)

**Overall layout**: Full-screen glassmorphism card (`max-w-5xl`, `rounded-3xl`, `shadow-2xl`), split left/right on tablet+, single column on mobile.

#### Background (behind the card)

- Solid page background: `bg-slate-100` (light) — matches the HTML example
- Three animated floating blobs using `framer-motion` `animate` with `transition: { duration: 20, repeat: Infinity, repeatType: 'reverse' }`:
  - Blob 1: DentiFlow primary `#1e56d0`, top-left, 500×500px, `blur-[80px]`, `opacity-40`
  - Blob 2: Lighter blue `#3b82f6`, bottom-right, same size, animation offset `-5s` equivalent
  - Blob 3: Slate `#94a3b8`, center, 300×300px, another offset
- Medical cross SVG pattern overlay (same as example): repeating SVG with `#cbd5e1` lines, `opacity-20`

#### Left Panel — `BrandingPanel.tsx` (`hidden md:flex`, dark gradient background)

- Background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` (same as example — works with DentiFlow's dark aesthetic)
- Decorative circles: two `absolute` divs using `bg-primary/10` and `bg-blue-500/10`
- **Logo block**: DentiFlow tooth icon (SVG inline) in a `bg-primary` rounded square + "Denti**Flow**" with "**Pro**" in `text-primary` teal-ish accent. Use `#2dd4bf` (teal) as accent on the dark panel only — it looks great against the dark.
- **Heading**: "Precision Care,\nSmart Management." — `text-4xl font-bold text-white`
- **Subtext**: "Welcome back to the DentiFlow Admin Portal. Manage appointments, patients, and clinic operations in one place." — `text-slate-400`
- **Stats widget**: white/5 background, rounded-2xl, border white/10. Shows a mock "Active Patients Today" with the group-of-people icon and a hardcoded number (e.g. `142`) — purely decorative mock
- **Copyright**: `text-xs text-slate-500` at bottom

#### Right Panel — `AdminLoginForm.tsx` (`w-full md:w-1/2`, light background)

- Background: `bg-white/85 backdrop-blur-xl` (glassmorphism)
- **Title**: "Admin Login" — `text-3xl font-bold text-slate-800`
- **Subtitle**: "Please enter your credentials to access the management portal." — `text-slate-500`
- **Email field**:
  - Label: "Admin Email" — `text-sm font-semibold text-slate-700`
  - Input: icon on `ps-` side (envelope SVG from lucide-react `Mail`), `rounded-xl border-slate-200 focus:border-primary`, Tailwind classes only (not MUI TextField — this page intentionally uses plain HTML inputs styled with Tailwind for a lighter, faster render)
  - `react-hook-form` registration with `required` + email pattern validation
- **Password field**:
  - Row with label "Password" on the left and "Forgot?" link on the right (mock href `#`)
  - Input: lock icon on `ps-` side (`Lock` from lucide-react), eye toggle button on `pe-` side (`Eye`/`EyeOff` from lucide-react)
  - `react-hook-form` registration with `required` + minLength 6
- **Remember me**: `<input type="checkbox">` + label "Keep me signed in for 30 days" — `text-sm text-slate-600`
- **Submit button**: full width, `bg-primary hover:bg-primary-dark`, white text, "Secure Access" label + arrow icon (`ArrowRight` lucide), loading state shows Framer Motion spinner + "Authenticating…"
- **Status message**: hidden div that becomes visible on submit — green on success, red on error
- **Footer**: "Need technical assistance?" + "Contact IT Support" link (mock `#`)

#### Animation Details

- Card entry: `motion.div` with `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}`
- Blobs: `motion.div` with continuous `animate` position/scale changes using `transition: { duration, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }`
- Submit loading: replace button content with Framer Motion spinning circle (or a simple CSS `animate-spin` border div)
- Error state: `motion.div` for the status banner with `initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}`

---

### Project Structure Changes

**MOVE (Task 2 — route group restructure):**

```
BEFORE:
frontend/src/app/[locale]/admin/
├── layout.tsx          ← sidebar layout (applies to all /admin/* routes)
└── dashboard/
    └── page.tsx

AFTER:
frontend/src/app/[locale]/admin/
├── login/
│   └── page.tsx        ← NEW: standalone, no sidebar
└── (dashboard)/        ← route group (no URL impact)
    ├── layout.tsx      ← MOVED: sidebar layout only applies to (dashboard)/*
    └── dashboard/
        └── page.tsx    ← MOVED: URL unchanged (/admin/dashboard)
```

**NEW files to create:**

```
frontend/src/
├── domain/auth/
│   └── entities.ts                               ← Admin auth domain types
├── application/
│   ├── auth/
│   │   └── adminAuthMockData.ts                  ← Mock admin users
│   └── useCases/auth/
│       └── mockAdminLogin.ts                     ← Login use case
├── infrastructure/stores/
│   └── adminAuthStore.ts                         ← Zustand auth store
└── presentation/admin/auth/
    ├── AdminLoginPage.tsx                        ← Client component (full page)
    ├── components/
    │   ├── AnimatedBlobs.tsx                     ← Background blobs
    │   ├── BrandingPanel.tsx                     ← Dark left panel
    │   └── AdminLoginForm.tsx                    ← Right form panel
    └── __tests__/
        └── AdminLoginPage.test.tsx
```

**Existing files to MODIFY:**

- `frontend/src/shared/messages/en.json` — add `"admin": { "auth": { ... } }`
- `frontend/src/shared/messages/fr.json` — add `"admin": { "auth": { ... } }`
- `frontend/src/shared/messages/ar.json` — add `"admin": { "auth": { ... } }`

---

### Technical Requirements

#### Domain Entities (`domain/auth/entities.ts`)

```typescript
// No framework imports — pure TypeScript interfaces only
export interface AdminLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "doctor" | "secretariat";
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  mockLogin: (credentials: AdminLoginCredentials) => boolean;
  mockLogout: () => void;
}
```

#### Mock Data (`application/auth/adminAuthMockData.ts`)

```typescript
// No React imports — pure data
import type {AdminUser} from "@/domain/auth/entities";

export const MOCK_ADMIN_PASSWORD = "admin123";

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "1",
    firstName: "Abdelaziz",
    lastName: "Admin",
    email: "admin@dentiflow.com",
    role: "admin",
  },
  {
    id: "2",
    firstName: "Dr. Sara",
    lastName: "Hassan",
    email: "doctor@dentiflow.com",
    role: "doctor",
  },
];
```

#### Zustand Store (`infrastructure/stores/adminAuthStore.ts`)

Follow `themeStore.ts` pattern exactly:

```typescript
import {create} from "zustand";
import {persist} from "zustand/middleware";
import type {
  AdminAuthState,
  AdminLoginCredentials,
} from "@/domain/auth/entities";
import {
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_PASSWORD,
} from "@/application/auth/adminAuthMockData";

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      mockLogin: (credentials: AdminLoginCredentials): boolean => {
        if (credentials.password !== MOCK_ADMIN_PASSWORD) return false;
        const user = MOCK_ADMIN_USERS.find(
          (u) => u.email === credentials.email,
        );
        if (!user) return false;
        set({isAuthenticated: true, currentUser: user});
        return true;
      },
      mockLogout: () => set({isAuthenticated: false, currentUser: null}),
    }),
    {name: "admin-auth-storage"},
  ),
);
```

#### Use Case (`application/useCases/auth/mockAdminLogin.ts`)

```typescript
import {useAdminAuthStore} from "@/infrastructure/stores/adminAuthStore";
import type {AdminLoginCredentials} from "@/domain/auth/entities";

export class MockAdminLoginUseCase {
  static execute(credentials: AdminLoginCredentials): boolean {
    return useAdminAuthStore.getState().mockLogin(credentials);
  }
}
```

#### Page Server Component (`app/[locale]/admin/login/page.tsx`)

Follow pattern of `app/[locale]/page.tsx`:

```typescript
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdminLoginPage } from '@/presentation/admin/auth/AdminLoginPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.auth' as any });
  return {
    title: `DentiFlow — ${t('login.title')}`,
    description: t('login.subtitle'),
  };
}

export default function AdminLoginRoute() {
  return <AdminLoginPage />;
}
```

#### AdminLoginPage Client Component (`presentation/admin/auth/AdminLoginPage.tsx`)

```typescript
"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedBlobs } from './components/AnimatedBlobs';
import { BrandingPanel } from './components/BrandingPanel';
import { AdminLoginForm } from './components/AdminLoginForm';

export function AdminLoginPage() {
  // Inject Poppins font (same pattern as AdminLayout)
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-slate-100 overflow-hidden relative"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Medical cross pattern overlay */}
      <div className="fixed inset-0 -z-10 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,...\")" }} />
      <AnimatedBlobs />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-5xl w-full flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <BrandingPanel />
        <AdminLoginForm />
      </motion.div>
    </div>
  );
}
```

#### AdminLoginForm (`presentation/admin/auth/components/AdminLoginForm.tsx`)

```typescript
"use client";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {motion, AnimatePresence} from "framer-motion";
import {Mail, Lock, Eye, EyeOff, ArrowRight} from "lucide-react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {MockAdminLoginUseCase} from "@/application/useCases/auth/mockAdminLogin";
import type {AdminLoginCredentials} from "@/domain/auth/entities";

export function AdminLoginForm() {
  const t = useTranslations("admin.auth");
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<AdminLoginCredentials>();

  const onSubmit = async (data: AdminLoginCredentials) => {
    setStatus("loading");
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1500));
    const success = MockAdminLoginUseCase.execute(data);
    if (success) {
      setStatus("success");
      setTimeout(() => router.push(`/${locale}/admin/dashboard`), 1000);
    } else {
      setStatus("error");
    }
  };

  // Render: email field, password field with toggle, remember me, status banner, submit button
}
```

#### Input styling (Tailwind, not MUI — intentional for this page)

```
// Field container
<div className="relative">
  <span className="absolute start-4 top-3.5 text-slate-400">  {/* 'start-' is RTL-safe */}
    <Mail size={18} />
  </span>
  <input
    className="w-full ps-12 pe-4 py-3 bg-white/50 border border-slate-200 rounded-xl
               focus:outline-none focus:border-primary focus:bg-white transition-all
               focus:ring-4 focus:ring-primary/20"
    {/* react-hook-form ...register('email', { required: true, pattern: /email regex/ }) */}
  />
</div>
```

Note: use `start-` / `end-` / `ps-` / `pe-` Tailwind logical properties everywhere — never `left-` / `right-` / `pl-` / `pr-`.

#### i18n keys to add (all 3 locale files)

```json
"admin": {
  "auth": {
    "login": {
      "title": "Admin Login",
      "subtitle": "Please enter your credentials to access the management portal.",
      "email_label": "Admin Email",
      "email_placeholder": "admin@dentiflow.com",
      "password_label": "Password",
      "forgot": "Forgot?",
      "remember": "Keep me signed in for 30 days",
      "submit": "Secure Access",
      "authenticating": "Authenticating…",
      "success": "Login successful! Redirecting…",
      "error": "Invalid credentials. Please try again.",
      "support_text": "Need technical assistance?",
      "support_link": "Contact IT Support"
    },
    "branding": {
      "tagline_1": "Precision Care,",
      "tagline_2": "Smart Management.",
      "description": "Welcome back to the DentiFlow Admin Portal. Manage appointments, patients, and clinic operations in one place.",
      "stats_label": "Active Patients Today",
      "copyright": "© 2026 DentiFlow Systems. All rights reserved."
    },
    "validation": {
      "email_required": "Email is required",
      "email_invalid": "Enter a valid email address",
      "password_required": "Password is required",
      "password_min": "Password must be at least 6 characters"
    }
  }
}
```

Provide French and Arabic translations for all keys.

---

### Library & Framework Requirements

| Library           | Version                | Usage                                                        | Notes                          |
| ----------------- | ---------------------- | ------------------------------------------------------------ | ------------------------------ |
| `react-hook-form` | latest (install)       | Form state + validation                                      | **NOT installed yet** — Task 1 |
| `framer-motion`   | `^12.38.0` (installed) | Blobs, card entry, status banner                             | `motion`, `AnimatePresence`    |
| `lucide-react`    | `^1.8.0` (installed)   | `Mail`, `Lock`, `Eye`, `EyeOff`, `ArrowRight`, `Users` icons |                                |
| `zustand`         | `^5.0.12` (installed)  | Admin auth store                                             | Follow `themeStore.ts` pattern |
| `next-intl`       | `^4.9.0` (installed)   | `useTranslations`, `useLocale`, `getTranslations`            |                                |
| `next/navigation` | built-in               | `useRouter` for redirect after login                         |                                |

**Note:** This page uses plain Tailwind-styled `<input>` elements instead of MUI `TextField`. This is intentional — the page is a standalone full-screen auth page outside the MUI theme provider context of the admin dashboard. MUI is available if needed for specific components.

---

### Testing Requirements

**Test file:** `frontend/src/presentation/admin/auth/__tests__/AdminLoginPage.test.tsx`

**Testing stack:** Jest 30 + jsdom + `@testing-library/react` v16 + `@testing-library/jest-dom` (already configured)

**Tests to cover:**

1. Renders email input, password input, and submit button
2. Shows validation error when submitted with empty email field
3. Shows validation error when submitted with empty password field
4. Eye toggle button switches password input type between `"password"` and `"text"`
5. Calls `MockAdminLoginUseCase.execute()` with form data on submission
6. Shows error status message when credentials are wrong (mock returns `false`)
7. BrandingPanel renders the company name and tagline

**Mock pattern** (follow `AdminDashboard.test.tsx` conventions):

```typescript
jest.mock("@/application/useCases/auth/mockAdminLogin", () => ({
  MockAdminLoginUseCase: {execute: jest.fn()},
}));
jest.mock("next/navigation", () => ({useRouter: () => ({push: jest.fn()})}));
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));
```

---

### RTL / i18n Implementation Checklist

- [ ] Zero physical direction classes (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-4`, `right-4`, `space-x-*`) in any new file
- [ ] Use `start-*`/`end-*` for absolutely-positioned icons inside inputs (RTL-aware)
- [ ] `ar.json` keys contain actual Arabic text, not English placeholders
- [ ] Test page at `/ar/admin/login` — form should mirror, labels should be RTL

---

### Previous Story Intelligence

- Story 0.4 (booking wizard) and patient-side login/register are **deferred** — do not create any patient auth files in this story
- The `BrandingPanel` left-side pattern established here will be reused for a future patient-facing auth story

---

### Recent Git Intelligence

Most recent commits touched `DashboardHeader.tsx` and `Sidebar.tsx`. Patterns to follow:

- Admin pages use `fontFamily: "'Poppins', sans-serif"` injected via `useEffect` (not global CSS)
- CSS token variables (`bg-primary`, `bg-page`, etc.) are defined in `globals.css` — use them via Tailwind utilities
- The dark gradient (`#0f172a → #1e293b`) is NOT a token — apply inline `style` or a one-off Tailwind class for the branding panel left side

---

### References

- [Source: docs/planning-artifacts/epics.md#Story-0.5]
- [Source: docs/planning-artifacts/architecture.md#Pre-Architecture-Locked-Decisions-§1-RTL/LTR-Strategy]
- [Source: docs/planning-artifacts/ux-design-specification.md#2.4-Admin-Side-Pages]
- [Source: frontend/src/app/globals.css] — CSS tokens (`bg-primary`, `bg-page`, `bg-card`, etc.)
- [Source: frontend/src/middleware.ts] — locale routing
- [Source: frontend/src/infrastructure/theme/themeStore.ts] — Zustand store pattern to follow
- [Source: frontend/src/application/useCases/admin/dashboard/toggleTheme.ts] — use case pattern
- [Source: frontend/src/app/[locale]/admin/layout.tsx] — file to MOVE to `(dashboard)/layout.tsx`
- [Source: frontend/src/app/[locale]/page.tsx] — server component page pattern
- [Source: frontend/src/presentation/landing/LandingHero.tsx] — framer-motion pattern
- [Source: frontend/package.json] — installed dependencies

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

N/A

### Completion Notes List

- Story scope narrowed to admin login page only — patient login/register deferred
- Design based on provided ClinicFlow HTML reference, adapted to DentiFlow theme tokens (`#1e56d0` primary, `#0f172a→#1e293b` dark panel)
- Route group restructuring completed: `admin/layout.tsx` + `admin/dashboard/page.tsx` moved into `admin/(dashboard)/` — login page lives outside and gets no sidebar (AC 9 ✅)
- `react-hook-form` installed via npm (pnpm had EPERM on node_modules — npm succeeded, package.json updated to `^7.72.1`)
- All inputs have `id`/`htmlFor` for accessibility and testability
- Plain Tailwind `<input>` elements used instead of MUI (intentional — standalone page outside MUI ThemeProvider)
- `start-*`/`end-*`/`ps-*`/`pe-*` used throughout for RTL safety (AC 8 ✅)
- Fake timer pattern in tests: `fireEvent.submit` → `waitFor(loading state)` → `act(jest.runAllTimers())` → `waitFor(result)`
- All 7 unit tests pass; full suite (12 tests) passes with 0 regressions
- Implemented: AnimatedBlobs (3 blobs), BrandingPanel (logo, tagline, stats widget, copyright), AdminLoginForm (email+password+toggle+remember+status+submit), AdminLoginPage (full-screen glassmorphism split)
- i18n keys added to en.json, fr.json (French), ar.json (Arabic) with proper translations

### File List

**MOVED:**
- `frontend/src/app/[locale]/admin/(dashboard)/layout.tsx` (was `admin/layout.tsx`)
- `frontend/src/app/[locale]/admin/(dashboard)/dashboard/page.tsx` (was `admin/dashboard/page.tsx`)

**NEW:**
- `frontend/src/domain/auth/entities.ts`
- `frontend/src/application/auth/adminAuthMockData.ts`
- `frontend/src/application/useCases/auth/mockAdminLogin.ts`
- `frontend/src/infrastructure/stores/adminAuthStore.ts`
- `frontend/src/presentation/admin/auth/AdminLoginPage.tsx`
- `frontend/src/presentation/admin/auth/components/AnimatedBlobs.tsx`
- `frontend/src/presentation/admin/auth/components/BrandingPanel.tsx`
- `frontend/src/presentation/admin/auth/components/AdminLoginForm.tsx`
- `frontend/src/presentation/admin/auth/__tests__/AdminLoginPage.test.tsx`
- `frontend/src/app/[locale]/admin/login/page.tsx`

**MODIFIED:**
- `frontend/src/shared/messages/en.json` (added `admin.auth` namespace)
- `frontend/src/shared/messages/fr.json` (added `admin.auth` namespace)
- `frontend/src/shared/messages/ar.json` (added `admin.auth` namespace)
- `frontend/package.json` (added `react-hook-form ^7.72.1`)

### Change Log

- 2026-04-13: Implemented Story 0.5 — Admin Login Page. Created full clean-architecture stack (domain → application → infrastructure → presentation → page), route group restructure, 3-locale i18n, 7 passing unit tests.
