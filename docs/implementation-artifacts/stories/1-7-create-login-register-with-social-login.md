# Story 1.7: Create Login/Register with Social Login

Status: ready-for-dev

## Story

As a patient (new or returning),
I want to log in or register using my email/password or Google account,
so that I can access the platform quickly and securely.

## Acceptance Criteria

1. **Given** I navigate to `/{locale}/auth/login` **When** the page loads **Then** I see a clean card-based login form with: email field, password field with show/hide toggle, "Forgot Password" link, a "Continue with Google" button (Google brand icon), and a "Don't have an account? Sign Up" link — no admin sidebar is present.
2. **Given** the patient login form **When** I submit with empty email or empty password **Then** inline validation errors appear beneath each field without a page reload (`react-hook-form` validation).
3. **Given** the patient login form **When** I submit valid mock credentials (`patient@dentiflow.com` / `patient123`) **Then** the button shows "Authenticating…" spinner, NextAuth `signIn("patient-credentials", {...})` is called, and on success the user is redirected to `/{locale}/patient/dashboard` (or to the `callbackUrl` if present).
4. **Given** the patient login form **When** I submit invalid credentials **Then** a red error banner appears reading "Invalid credentials. Please try again." — no redirect occurs.
5. **Given** the "Continue with Google" button **When** I click it **Then** `signIn("google")` is called, the Google OAuth consent flow starts, and on successful authorization the user is redirected to `/{locale}/patient/dashboard` with a NextAuth session containing `role: "patient"` and `clinic_id: ""`.
6. **Given** I navigate to `/{locale}/auth/register` **When** the page loads **Then** I see a multi-step registration form with a visual step progress indicator showing three steps: "Personal Info" → "Contact" → "Preferences".
7. **Given** Step 1 (Personal Info) **When** I fill in `firstName`, `lastName`, and `dateOfBirth` fields and click "Next" **Then** the form transitions to Step 2 (Contact).
8. **Given** Step 1 **When** I click "Next" with any required field empty **Then** inline validation errors appear without advancing to Step 2.
9. **Given** Step 2 (Contact) **When** I fill in `email`, `phone`, `password`, and `confirmPassword` and click "Next" **Then** the form transitions to Step 3 (Preferences).
10. **Given** Step 2 **When** `password` and `confirmPassword` do not match **Then** an inline error "Passwords do not match" appears on `confirmPassword`.
11. **Given** Step 3 (Preferences) **When** I choose language preference and notification opt-ins and click "Complete Registration" **Then** a mock registration succeeds (no real API call — Epic 8 dependency), a success toast is shown, and the user is redirected to `/{locale}/auth/login?registered=true`.
12. **Given** the login page is loaded with `?registered=true` query param **When** the page renders **Then** a green success banner is shown: "Account created! Please sign in."
13. **Given** the Arabic locale (`ar`) **When** any patient auth page renders **Then** all spacing uses Tailwind logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`) — no physical direction classes (`pl-*`, `pr-*`, `ml-*`, `mr-*`). Form direction is RTL.
14. **Given** any viewport **When** on mobile (≤ 768px) **Then** the patient auth pages are single-column and touch-friendly (no split-panel layout required — simpler than admin login).

## Tasks / Subtasks

- [ ] Task 1: Add GoogleProvider to nextauth.config.ts (AC: 5)
  - [ ] Open `frontend/src/infrastructure/auth/nextauth.config.ts`
  - [ ] Add `import GoogleProvider from "next-auth/providers/google"` at top (no new package install — `next-auth@4` ships it)
  - [ ] Add `GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })` to the `providers` array
  - [ ] Add a second `CredentialsProvider` with `id: "patient-credentials"` that validates against `patientLoginUseCase.execute()` and returns `{ id, email, name, role: "patient", clinic_id: "", user_id: id }`
  - [ ] Update the `jwt` callback: detect `account?.provider === "google"` and set `token.role = "patient"`, `token.clinic_id = ""`, `token.user_id = token.sub ?? ""`; the existing credentials path is unchanged
  - [ ] Keep `session` callback unchanged (it already maps `token.role`, `token.clinic_id`, `token.user_id` to `session.user`)
  - [ ] Create `frontend/.env.local` (if not exists) and add `GOOGLE_CLIENT_ID=`, `GOOGLE_CLIENT_SECRET=`, `NEXTAUTH_URL=http://localhost:3000`, `NEXTAUTH_SECRET=<generate with openssl rand -base64 32>`

- [ ] Task 2: Create domain entities for patient auth (AC: 3, 5, 7, 9, 11)
  - [ ] Create `frontend/src/domain/auth/entities/PatientUser.ts` with:
    - `PatientLoginCredentials { email: string; password: string }`
    - `PatientUser { id: string; firstName: string; lastName: string; email: string; role: "patient"; phone?: string }`
    - `PatientRegistrationData { firstName: string; lastName: string; dateOfBirth: Date; email: string; phone: string; password: string; confirmPassword: string; preferredLanguage: "en" | "fr" | "ar"; notificationsEmail: boolean; notificationsWhatsApp: boolean }`
  - [ ] All types must be pure TypeScript — zero framework imports

- [ ] Task 3: Create patient auth repository interface and mock implementation (AC: 3, 11)
  - [ ] Create `frontend/src/domain/auth/repositories/PatientAuthRepository.ts` with `login(credentials: PatientLoginCredentials): Promise<PatientUser | null>` and `register(data: PatientRegistrationData): Promise<PatientUser>`
  - [ ] Create `frontend/src/infrastructure/repositories/PatientAuthRepositoryImpl.ts` — mock: `login` checks against a hardcoded array (email: `patient@dentiflow.com`, password: `patient123`); `register` always returns success with a generated mock user
  - [ ] Reuse the `AdminUser.ts` import pattern from `AdminAuthRepositoryImpl.ts` for reference

- [ ] Task 4: Create patient auth use cases (AC: 3, 11)
  - [ ] Create `frontend/src/application/useCases/auth/PatientLogin.ts` — class with `execute(credentials: PatientLoginCredentials): Promise<PatientUser | null>`; depends only on `PatientAuthRepository` interface
  - [ ] Create `frontend/src/application/useCases/auth/PatientRegister.ts` — class with `execute(data: PatientRegistrationData): Promise<PatientUser>`; depends only on `PatientAuthRepository` interface

- [ ] Task 5: Wire patient use cases into DI container (AC: 3, 11)
  - [ ] Update `frontend/src/infrastructure/container/index.ts`:
    - Import `PatientAuthRepositoryImpl` and use case classes
    - Add `const patientAuthRepository = new PatientAuthRepositoryImpl()`
    - Export `patientLoginUseCase` and `patientRegisterUseCase`
  - [ ] Do NOT break existing `adminLoginUseCase` export

- [ ] Task 6: Build patient login page components (AC: 1, 2, 3, 4, 5, 12, 13, 14)
  - [ ] Create `frontend/src/presentation/patient/auth/components/PatientLoginForm.tsx` (`"use client"`)
    - `react-hook-form` for email + password fields
    - Show/hide password toggle (eye icon from `lucide-react`)
    - Google button calls `signIn("google", { callbackUrl: "/${locale}/patient/dashboard" })`
    - Credentials submit calls `signIn("patient-credentials", { email, password, redirect: false, callbackUrl })`, handles error
    - Green banner if `searchParams.registered === "true"` (passed as prop)
    - Red error banner on `CredentialsSignin` NextAuth error
    - RTL-safe: only `ps-*`, `pe-*`, `ms-*`, `me-*` — no `pl-*`, `pr-*`, etc.
  - [ ] Create `frontend/src/presentation/patient/auth/PatientLoginPage.tsx` — composes the form in a centered card layout (no split-panel; simpler than admin)

- [ ] Task 7: Build patient multi-step register components (AC: 6, 7, 8, 9, 10, 11, 13, 14)
  - [ ] Create `frontend/src/presentation/patient/auth/components/PatientRegisterStep1.tsx` — fields: `firstName`, `lastName`, `dateOfBirth`; validates on Next click
  - [ ] Create `frontend/src/presentation/patient/auth/components/PatientRegisterStep2.tsx` — fields: `email`, `phone`, `password`, `confirmPassword`; validates password match
  - [ ] Create `frontend/src/presentation/patient/auth/components/PatientRegisterStep3.tsx` — fields: `preferredLanguage` (select), `notificationsEmail` (checkbox), `notificationsWhatsApp` (checkbox); Complete Registration submits via `usePatientAuthStore().register(data)`
  - [ ] Create `frontend/src/presentation/patient/auth/components/StepProgressIndicator.tsx` — shows 3 steps with current step highlighted; accessible (`aria-current="step"`)
  - [ ] Create `frontend/src/presentation/patient/auth/PatientRegisterPage.tsx` — manages `currentStep` state (1–3), assembles form data across steps, calls `patientRegisterUseCase`, redirects on success

- [ ] Task 8: Create Next.js page routes (AC: 1, 6)
  - [ ] Create `frontend/src/app/[locale]/auth/login/page.tsx` — server component with metadata; renders `<PatientLoginPage registered={searchParams?.registered === "true"} />`; note: `auth/` is NOT inside `(dashboard)` group — no admin layout
  - [ ] Create `frontend/src/app/[locale]/auth/register/page.tsx` — server component with metadata; renders `<PatientRegisterPage />`
  - [ ] Both pages are under `[locale]/` (required by middleware locale matching) and outside `admin/` (no auth guard)

- [ ] Task 9: Add i18n translation keys (AC: 1, 2, 3, 4, 5, 6, 13)
  - [ ] Add `patient.auth` namespace to `frontend/src/shared/messages/en.json`:
    - `login.title`, `login.subtitle`, `login.email_label`, `login.password_label`, `login.forgot`, `login.google_button`, `login.submit`, `login.authenticating`, `login.error`, `login.success_registered`, `login.no_account`, `login.sign_up`
    - `register.title`, `register.step1_label`, `register.step2_label`, `register.step3_label`, `register.next`, `register.back`, `register.submit`, `register.success`
    - Validation messages: `validation.email_required`, `validation.password_required`, `validation.password_min`, `validation.password_mismatch`, `validation.first_name_required`, `validation.last_name_required`
  - [ ] Mirror all keys to `fr.json` (French translations)
  - [ ] Mirror all keys to `ar.json` (Arabic translations, RTL content)

- [ ] Task 10: Write unit tests (AC: 1, 2, 3, 4, 5, 11)
  - [ ] Create `frontend/src/presentation/patient/auth/__tests__/PatientLoginPage.test.tsx`
    - Test: renders email, password, Google button, Sign Up link
    - Test: shows validation errors on empty submit
    - Test: calls `signIn("patient-credentials", ...)` on valid submit
    - Test: shows error banner on `CredentialsSignin` error
    - Test: shows success banner when `registered=true` prop passed
  - [ ] Create `frontend/src/application/useCases/auth/__tests__/PatientLogin.test.ts`
    - Test: valid credentials returns `PatientUser` with `role: "patient"`
    - Test: invalid credentials returns `null`

## Dev Notes

### Critical Architecture Constraints (DO NOT VIOLATE)

1. **NextAuth version: `next-auth@4.x` ONLY.** Already installed at `^4.24.13`. Do NOT upgrade to v5/Auth.js. `GoogleProvider` is at `next-auth/providers/google` in v4.

2. **GoogleProvider requires environment variables at runtime.** Add to `frontend/.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
   ```
   Google Cloud Console → APIs & Services → Credentials: set Authorized redirect URI to `http://localhost:3000/api/auth/callback/google`. For production, add the prod domain. The `NEXTAUTH_SECRET` MUST be set or NextAuth will warn in production.

3. **Patient credentials use a SEPARATE CredentialsProvider (`id: "patient-credentials"`)** — not the existing admin one (`id: "credentials"`). This keeps auth paths cleanly separated. The `signIn` call must use the matching id:
   - Admin: `signIn("credentials", ...)` — unchanged
   - Patient credentials: `signIn("patient-credentials", ...)`
   - Google: `signIn("google", ...)` — works for both admin/patient (only shown on patient pages)

4. **JWT callback update — handle Google provider case:**
   ```ts
   async jwt({ token, user, account }) {
     if (account?.provider === "google") {
       // Google sign-in: user is a patient, no clinic_id yet
       token.role = "patient";
       token.clinic_id = "";
       token.user_id = token.sub ?? "";
     } else if (user) {
       // Credentials sign-in (admin or patient-credentials)
       token.role = (user as any).role;
       token.clinic_id = (user as any).clinic_id;
       token.user_id = (user as any).user_id;
     }
     return token;
   }
   ```
   The `account` parameter is only present on initial sign-in. The `else if (user)` path handles both admin and patient credentials sign-ins.

5. **Middleware does NOT need to change.** The current middleware only guards `/(ar|en|fr)/admin/*` routes. Patient auth routes at `/(locale)/auth/*` are already public (the `authorized` callback returns `true` for all non-admin routes). Do NOT modify `frontend/src/middleware.ts`.

6. **Patient auth pages routing — no layout inheritance from admin.** Patient pages at `[locale]/auth/login` and `[locale]/auth/register` sit outside `[locale]/admin/` completely, so they inherit ONLY the `[locale]/layout.tsx` (SessionProvider + NextIntlClientProvider). No sidebar, no dashboard header.

7. **Clean Architecture layering — match existing patterns:**
   - `domain/auth/entities/PatientUser.ts` → pure TS types (no imports from React, Zustand, next-auth)
   - `domain/auth/repositories/PatientAuthRepository.ts` → interface only
   - `application/useCases/auth/PatientLogin.ts` → class with `execute()`, no API calls
   - `application/useCases/auth/PatientRegister.ts` → class with `execute()`, no API calls
   - `infrastructure/repositories/PatientAuthRepositoryImpl.ts` → implements the interface, mock data only (auth-service not live — Epic 8.3 is `done` but not wired to frontend yet)
   - `infrastructure/container/index.ts` → add patient use case instances (extend existing, do NOT replace)
   - `presentation/patient/auth/` → React components (`"use client"`)
   - `app/[locale]/auth/login/page.tsx` and `app/[locale]/auth/register/page.tsx` → server components (no `"use client"`)

8. **RTL-safe CSS only (non-negotiable):** Use Tailwind logical utilities ONLY:
   - ✅ `ps-4`, `pe-4`, `ms-2`, `me-2`, `gap-4`, `start-0`, `end-0`
   - ❌ `pl-4`, `pr-4`, `ml-2`, `mr-2`, `space-x-*`, `left-0`, `right-0`
   [Source: docs/planning-artifacts/architecture.md#Pre-Architecture Locked Decisions - RTL/LTR Strategy]

9. **No real API calls — auth-service is NOT wired to frontend yet.** Epic 8.3 (`initialize-auth-service`) is `done` at service level but the frontend infrastructure (`PatientAuthRepositoryImpl`) must use mock data for now. When auth-service is live (Epic 2), only `PatientAuthRepositoryImpl` changes — use cases and stores remain unchanged.

10. **`clinic_id` for patients is blank at login time.** Per architecture: "JWT claim is source of truth for effective clinic scope." Patients are assigned a `clinic_id` when they book at a specific clinic (Epic 3). Until then, leave `clinic_id: ""` in the JWT. Do NOT invent a clinic_id for patients.
    [Source: docs/planning-artifacts/architecture.md#Pre-Architecture Locked Decisions - clinic_id Scoping Strategy]

11. **Multi-step form state management:** Use local React `useState` in `PatientRegisterPage.tsx` to track `currentStep` (1 | 2 | 3) and accumulated form data across steps. Do NOT use Zustand for transient multi-step form state. Each step component receives its section data and an `onNext(data)` callback. The parent assembles the full `PatientRegistrationData` object before calling the use case.

12. **Password security:** In `react-hook-form` registration, do NOT persist the password in any Zustand store. After `patientRegisterUseCase.execute(data)` succeeds, discard the password — only store non-sensitive profile data if needed. (Epic 2 will handle real auth token flow.)

13. **`signIn("patient-credentials")` callbackUrl:** Pass `callbackUrl: `/${locale}/patient/dashboard`` so after successful login, NextAuth redirects to the patient area. Use `useLocale()` from `next-intl/client` inside the `"use client"` form component to get the active locale.

### Project Structure Notes

**Files to create (new):**
```
frontend/src/domain/auth/entities/PatientUser.ts
frontend/src/domain/auth/repositories/PatientAuthRepository.ts
frontend/src/application/useCases/auth/PatientLogin.ts
frontend/src/application/useCases/auth/PatientRegister.ts
frontend/src/application/useCases/auth/__tests__/PatientLogin.test.ts
frontend/src/infrastructure/repositories/PatientAuthRepositoryImpl.ts
frontend/src/presentation/patient/auth/components/PatientLoginForm.tsx
frontend/src/presentation/patient/auth/components/PatientRegisterStep1.tsx
frontend/src/presentation/patient/auth/components/PatientRegisterStep2.tsx
frontend/src/presentation/patient/auth/components/PatientRegisterStep3.tsx
frontend/src/presentation/patient/auth/components/StepProgressIndicator.tsx
frontend/src/presentation/patient/auth/PatientLoginPage.tsx
frontend/src/presentation/patient/auth/PatientRegisterPage.tsx
frontend/src/presentation/patient/auth/__tests__/PatientLoginPage.test.tsx
frontend/src/app/[locale]/auth/login/page.tsx
frontend/src/app/[locale]/auth/register/page.tsx
frontend/.env.local   (gitignored — add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL)
```

**Files to modify (existing):**
```
frontend/src/infrastructure/auth/nextauth.config.ts   — add GoogleProvider + patient-credentials provider + updated jwt callback
frontend/src/infrastructure/container/index.ts        — add PatientAuthRepositoryImpl, patientLoginUseCase, patientRegisterUseCase exports
frontend/src/shared/messages/en.json                  — add patient.auth namespace
frontend/src/shared/messages/fr.json                  — add patient.auth namespace
frontend/src/shared/messages/ar.json                  — add patient.auth namespace
```

**Files NOT to touch:**
```
frontend/src/middleware.ts                            — NO CHANGE: admin auth guard is correct; patient routes already public
frontend/src/infrastructure/auth/next-auth.d.ts       — NO CHANGE: type augmentations already cover patient role
frontend/src/domain/auth/entities/AdminUser.ts        — NO CHANGE: UserRole already includes "patient"
frontend/src/infrastructure/repositories/AdminAuthRepositoryImpl.ts  — NO CHANGE
frontend/src/presentation/stores/adminAuthStore.ts    — NO CHANGE
```

### Previous Story Intelligence

**From Story 1.1 (JWT Authentication — `done`):**
- `next-auth@4.24.13` is installed in `frontend/package.json`
- `frontend/src/infrastructure/auth/nextauth.config.ts` exists with `CredentialsProvider` for admin
- `frontend/src/infrastructure/auth/next-auth.d.ts` exists — `UserRole` already includes `"patient"`
- `frontend/src/app/api/auth/[...nextauth]/route.ts` exists and works — do NOT recreate
- `frontend/src/app/[locale]/providers.tsx` wraps `<SessionProvider>` — patient pages inherit it automatically
- Middleware (`frontend/src/middleware.ts`) is live with `withAuth` + `next-intl` chain; admin routes are guarded, all others pass through

**From Story 0.5 (Admin Login — `review`):**
- `react-hook-form@7.x` is installed — reuse for patient form validation (same pattern as `AdminLoginForm.tsx`)
- Admin login is at `[locale]/admin/login/` (separate route group) — do NOT confuse with `[locale]/auth/`
- `lucide-react` is available for icons (eye/eye-off for password toggle)
- `framer-motion@12.x` is available for entrance animations if desired
- Tailwind CSS token classes in `globals.css`: `bg-page`, `bg-card`, `bg-primary`, `border-ui-border` — use for consistency
- Component pattern: `"use client"` directive on all interactive components; Next.js page at `app/[locale]/...` is a server component

**From Story 0.2 (Patient Mobile Shell — `review`):**
- Patient-facing pages use the locale layout at `app/[locale]/layout.tsx` — this gives `NextIntlClientProvider` + `SessionProvider`
- The Patient Mobile Shell header exists — patient auth pages may optionally include it (or be standalone fullscreen). Given UX spec says "Clean, pro-website style with card-based layouts", use a standalone centered layout (similar to admin but without split panel)

### References

- Google OAuth Provider docs (NextAuth v4): https://next-auth.js.org/providers/google [Source: docs/planning-artifacts/architecture.md#Authentication--Security]
- NextAuth v4 JWT callback with account param: https://next-auth.js.org/configuration/callbacks#jwt-callback
- RTL/LTR strategy: [Source: docs/planning-artifacts/architecture.md#Pre-Architecture Locked Decisions - RTL/LTR Strategy]
- UX design spec — Patient Login page: [Source: docs/planning-artifacts/ux-design-specification.md#Patient Registration/Login Pages]
- Clean Architecture frontend: [Source: docs/planning-artifacts/architecture.md#Frontend Clean Architecture]
- Auth model (JWT claims): [Source: docs/planning-artifacts/architecture.md#Authentication--Security]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

### Completion Notes List

### File List
