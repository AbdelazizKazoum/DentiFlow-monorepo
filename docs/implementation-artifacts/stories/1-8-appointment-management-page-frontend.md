---
story_id: 1-8-appointment-management-page-frontend
epic: Epic 1 - Platform Foundation
title: Implement Appointment Management Page — FullCalendar (Frontend Only)
status: review
assignee: TBD
estimate: 8 pts
priority: High
---

## Story Overview

As the secretariat,
I want a professional weekly calendar page in the admin dashboard,
So that I can visually manage and create patient appointments by clicking on time slots, with a pro-grade clinical scheduling experience.

---

## Project & Architecture Context

**Project:** dentiflow-menorepo  
**Framework:** Next.js 16 (App Router), TypeScript (strict mode)  
**Styling:** Tailwind CSS v4 + MUI v9 (dual system — MUI for dialogs/inputs, Tailwind for layout)  
**State:** Zustand stores (per-feature slice)  
**Architecture:** Clean Architecture — strict layer separation  
**i18n:** next-intl, Arabic RTL + French + English

### Current Routing Architecture (CRITICAL for dev agent)

The admin dashboard uses **Next.js App Router with a shared group layout**:

```
src/app/[locale]/admin/(dashboard)/
  layout.tsx          ← shared layout: Sidebar + Header + <children/>
  dashboard/page.tsx  ← currently renders AdminDashboard component
```

The `layout.tsx` owns the `Sidebar` and passes `activeTab` (local state) + `onTabChange` to it.  
**The sidebar tab selection is purely visual — it does NOT drive routing today.**  
The actual page content comes from `children` (Next.js routing).

**This story must wire the sidebar to proper App Router navigation.**

### Clean Architecture Layers (Frontend)

```
domain/{feature}/entities/        ← Pure TS types, no framework
application/{feature}/useCases/   ← execute() only, no API calls
infrastructure/api/               ← Axios DTOs only
infrastructure/mappers/           ← DTO ↔ Domain Entity
infrastructure/repositories/      ← Implements domain interfaces
presentation/store/               ← Zustand stores per feature
presentation/components/          ← React components, no API calls
presentation/app/                 ← Next.js adapter (layouts, pages)
shared/                           ← Cross-cutting utils
```

**Forbidden patterns (enforced by architecture):**

- ❌ No API calls inside Zustand stores or React components
- ❌ No global `entities/` folder
- ❌ No DTO types outside `infrastructure/`
- ❌ No business logic in Zustand stores
- ❌ No repository interfaces declared inside `infrastructure/`

> For this story (frontend + mock data only): all logic lives in the **Presentation Layer** only. Domain/Application/Infrastructure layers will be wired in the backend integration story.

---

## Acceptance Criteria

**Given** the admin dashboard is loaded and the sidebar is present  
**When** the secretariat clicks "Schedule" in the sidebar  
**Then** the browser navigates to the Appointments Calendar page (`/[locale]/admin/schedule`)  
**And** a FullCalendar weekly time-grid is displayed with working hours Mon–Fri 09:00–18:00  
**And** clicking an empty slot opens a MUI Dialog to create a new appointment  
**And** the form pre-fills start time and auto-computes end time (+30 min)  
**And** clicking an existing appointment event opens the same dialog pre-filled for editing or deletion  
**And** appointments are color-coded by status: confirmed (green), pending (yellow), cancelled (red)  
**And** overlapping appointments are prevented client-side  
**And** bookings outside working hours are rejected with a clear error message  
**And** all interactions use mock data only — no backend/API calls  
**And** the sidebar "Schedule" item is highlighted as active when on this page

---

## Technical Requirements

### 1. Package Installation

Install FullCalendar packages (add to `frontend/package.json`):

```bash
pnpm add @fullcalendar/react @fullcalendar/timegrid @fullcalendar/interaction
```

These packages are NOT yet in `package.json` — the dev agent must install them.  
Do not use ShadCN UI or any other component library beyond MUI and Tailwind.

### 2. New App Router Route

Create the new page at:

```
frontend/src/app/[locale]/admin/(dashboard)/schedule/page.tsx
```

This automatically adds the `/[locale]/admin/schedule` route under the existing shared layout (Sidebar + Header).

### 3. Sidebar Navigation — Wire to App Router

**Current state:** `Sidebar.tsx` receives `onTabChange(tab: string)` and sets local state in `layout.tsx`. This does not navigate.

**Required change:** Update `layout.tsx` and `Sidebar.tsx` so that tab clicks navigate using `useRouter().push()`, and the active tab is derived from `usePathname()` — not local state.

Tab → Route mapping:
| Sidebar Tab | Route |
|---|---|
| Dashboard | `/[locale]/admin/dashboard` |
| Schedule | `/[locale]/admin/schedule` |
| Patients | `/[locale]/admin/patients` (placeholder, no page needed yet) |
| Medicines | `/[locale]/admin/medicines` (placeholder) |
| Messages | `/[locale]/admin/messages` (placeholder) |

Use `usePathname()` from `next/navigation` to determine the active tab — no more local `activeTab` state in `layout.tsx`.

### 4. Appointment Type (Mock Data)

Define the `Appointment` type in `frontend/src/presentation/admin/dashboard/appointments/types.ts`:

```ts
export type AppointmentStatus = "confirmed" | "pending" | "cancelled";

export interface Appointment {
  id: string;
  title: string; // Patient name (displayed on calendar block)
  start: string; // ISO 8601 datetime string
  end: string; // ISO 8601 datetime string
  status: AppointmentStatus;
  patientName: string;
  service: string;
  notes?: string;
}
```

### 5. Mock Data

Create `frontend/src/presentation/admin/dashboard/appointments/mockAppointments.ts`:

Provide at least 5–8 realistic mock appointments spread across the current work week (Mon–Fri), with a mix of statuses (confirmed, pending, cancelled). Use ISO datetime strings. Services should include realistic dental procedures (e.g., "Consultation", "Teeth Cleaning", "Root Canal", "Filling", "Orthodontic Check").

### 6. Calendar Component

Create `frontend/src/presentation/admin/dashboard/appointments/AppointmentCalendar.tsx`:

**FullCalendar configuration:**

- Plugins: `timeGridPlugin`, `interactionPlugin`
- Default view: `timeGridWeek`
- Also support: `timeGridDay` (add header toolbar buttons to switch)
- Business hours: Mon–Fri, 09:00–18:00
- `slotDuration`: `"00:30:00"`
- `slotLabelInterval`: `"00:30:00"`
- `allDaySlot`: `false`
- `selectable`: `true` — enables click-to-create
- `editable`: `true` — enables drag & drop to reschedule
- `eventResizableFromStart`: `false`
- `eventDurationEditable`: `true` — enables resize to extend
- `select` callback → open Create dialog with pre-filled start/end
- `eventClick` callback → open Edit/View dialog with event data
- `eventDrop` + `eventResize` callbacks → update state in place
- `eventConstraint`: restrict to business hours
- `selectConstraint`: restrict to business hours
- `nowIndicator`: `true`

**Event color mapping by status (modern palette):**

```ts
const statusColors: Record<
  AppointmentStatus,
  {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  confirmed: {
    backgroundColor: "linear-gradient(135deg, #10b981 0%, #059669 100%)", // emerald gradient
    borderColor: "#059669",
    textColor: "#ffffff",
  },
  pending: {
    backgroundColor: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", // amber gradient
    borderColor: "#d97706",
    textColor: "#ffffff",
  },
  cancelled: {
    backgroundColor: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", // red gradient
    borderColor: "#dc2626",
    textColor: "#ffffff",
  },
};
```

Use these in FullCalendar's `eventContent` function to render custom event blocks with gradients, rounded corners, and status badges.

### 7. Appointment Modal (MUI Dialog)

Create `frontend/src/presentation/admin/dashboard/appointments/AppointmentModal.tsx`:

Use `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` from MUI.

**Form fields (use `react-hook-form`):**

- Patient Name — MUI `TextField`, required, min 2 chars
- Service — MUI `Select` with options: Consultation, Teeth Cleaning, Root Canal, Filling, Orthodontic Check, Extraction, Crown Fitting
- Start Time — MUI `TextField` type `datetime-local`, pre-filled from clicked slot
- End Time — MUI `TextField` type `datetime-local`, auto-set to start + 30 min, editable
- Status — MUI `Select`: confirmed, pending, cancelled
- Notes — MUI `TextField` multiline, optional

**Validation:**

- End time must be after start time
- Both start and end must be within business hours (09:00–18:00, Mon–Fri)
- No overlapping with existing appointments (check state, skip checking the appointment being edited)
- Show inline MUI `FormHelperText` errors

**Modal modes:**

- `mode: 'create'` — shows "Create Appointment" title, Save button
- `mode: 'edit'` — shows "Edit Appointment" title, Save + Delete button (with MUI red `color="error"`)

**On Save:** add/update appointment in React state and close modal  
**On Delete:** remove appointment from state with a confirmation step (MUI `Alert` or second dialog)  
**On Cancel:** close without changes

### 8. Page Component

Create `frontend/src/presentation/admin/dashboard/appointments/Page.tsx`:

This is the main presentational component rendered by the route page.

Structure:

```
<div className="h-full flex flex-col gap-6">
  <PageHeader />         ← title "Appointment Schedule", subtitle, + "New Appointment" button
  <AppointmentCalendar /> ← full FullCalendar with state management
  <AppointmentModal />    ← controlled by open state
</div>
```

- Manage `appointments` state at this level (array of `Appointment`)
- Initialize with `mockAppointments`
- Pass handlers down to `AppointmentCalendar` and `AppointmentModal`

### 9. Route Page (App Router adapter)

`frontend/src/app/[locale]/admin/(dashboard)/schedule/page.tsx`:

```tsx
"use client";
import {AppointmentsPage} from "@presentation/admin/dashboard/appointments/Page";

export default function SchedulePage() {
  return <AppointmentsPage />;
}
```

This is the only App Router file needed — all logic stays in the presentation component.

---

## File Structure Summary

```
frontend/src/
  app/[locale]/admin/(dashboard)/
    layout.tsx                          ← UPDATE: use router/pathname for active tab
    schedule/
      page.tsx                          ← NEW: App Router adapter

  presentation/admin/dashboard/
    appointments/
      Page.tsx                          ← NEW: main page component
      AppointmentCalendar.tsx           ← NEW: FullCalendar wrapper
      AppointmentModal.tsx              ← NEW: MUI Dialog form
      types.ts                          ← NEW: Appointment type
      mockAppointments.ts               ← NEW: mock data

  sidebar/
    Sidebar.tsx                         ← UPDATE: use router for navigation
```

---

## UX & Design Requirements

- **Modern Design System Integration:** Leverage Tailwind CSS v4 for responsive layouts, spacing, and utilities, combined with MUI v9's Material Design 3 principles for a contemporary, professional look. Use MUI's theme provider for consistent color palettes, typography, and component styling.
- **Calendar Aesthetics:**
  - FullCalendar container should have a clean, card-like appearance with subtle shadows (`shadow-sm` or `shadow-md`), rounded corners (`rounded-lg`), and a white/light background that matches the dashboard's `bg-card` token.
  - Use modern event styling: events should have rounded corners, subtle gradients for status colors, and improved typography with better contrast.
  - Header toolbar should be styled with MUI-inspired buttons, using Tailwind classes for spacing and MUI's `Button` component for view switches.
  - Time slots should have hover effects and smooth transitions for better interactivity.
- **Color Scheme & Theming:**
  - Status colors: Use modern, accessible color variants (e.g., confirmed: `bg-green-500/90`, pending: `bg-amber-500/90`, cancelled: `bg-red-500/90`) with white text for high contrast.
  - Incorporate MUI's color system for form elements and dialogs to ensure consistency.
  - Support for potential dark mode by using CSS variables or MUI's theme modes.
- **Layout & Responsiveness:**
  - Calendar must fill available height using `h-full` and `flex-1`, with proper flex layouts.
  - Responsive design: On smaller screens (below 1024px), switch to a mobile-friendly view or use FullCalendar's responsive options.
  - Use Tailwind's responsive prefixes (`md:`, `lg:`) for adaptive layouts.
- **Interactive Elements:**
  - "New Appointment" button: MUI `Button` with `variant="contained"`, modern elevation (`elevation={2}`), and an add icon from MUI icons.
  - Modal design: Use MUI's `Dialog` with modern styling, including backdrop blur effects if supported, and smooth enter/exit animations.
  - Form fields: MUI `TextField` and `Select` with outlined variants for a clean, modern appearance, including helper texts and error states with smooth transitions.
- **Typography & Spacing:**
  - Use MUI's typography scale for headings and body text.
  - Consistent spacing using Tailwind's space utilities (`gap-4`, `p-6`, etc.).
  - Event titles in calendar should use bold, readable fonts with appropriate sizing.
- **Accessibility & RTL:**
  - All MUI components are inherently accessible; ensure custom elements follow WCAG guidelines.
  - Use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`) for RTL support — avoid `ml-`/`mr-`.
  - Keyboard navigation must work seamlessly in modals and calendar interactions.
- **FullCalendar Customization:**
  - Import and customize FullCalendar styles to match the design system: override default CSS with Tailwind/MUI-compatible classes.
  - Add custom event content rendering for status badges, patient names, and service types with modern icons.
  - Implement smooth animations for event creation, editing, and deletion using CSS transitions or MUI's animation utilities.
- **Overall Polish:**
  - Subtle animations: Add hover effects, loading states, and transition animations for a premium feel.
  - Status indicators: Use MUI `Chip` components or custom badges within events for status display.
  - Error handling: Modern error messages with MUI `Alert` components for validation feedback.

---

## Constraints & Business Rules

---

## Tasks/Subtasks

- [x] Install FullCalendar packages and add `Appointment` type
- [x] Create mock data and implement `AppointmentCalendar` component
- [x] Implement `AppointmentModal` and wire up to calendar state
- [x] Implement `Page.tsx` and App Router route `schedule/page.tsx`
- [x] Wire sidebar navigation to proper App Router navigation instead of local state

---

## Dev Agent Record

### Debug Log

- Extracted and wired the `Sidebar` to dynamically map `AdminDashboard` components rather than internal `useState` navigation per architectural guidance.
- Implemented `@fullcalendar/react` plugins and fully integrated local mock data states per Acceptance Criteria.
- Hooked `react-hook-form` inputs into MUI with dynamic updates tracking the internal memory store locally.

### File List

- `frontend/package.json`
- `frontend/src/app/[locale]/admin/(dashboard)/layout.tsx`
- `frontend/src/app/[locale]/admin/(dashboard)/schedule/page.tsx`
- `frontend/src/presentation/admin/dashboard/appointments/AppointmentCalendar.tsx`
- `frontend/src/presentation/admin/dashboard/appointments/AppointmentModal.tsx`
- `frontend/src/presentation/admin/dashboard/appointments/mockAppointments.ts`
- `frontend/src/presentation/admin/dashboard/appointments/Page.tsx`
- `frontend/src/presentation/admin/dashboard/appointments/types.ts`
- `frontend/src/presentation/admin/dashboard/sidebar/Sidebar.tsx`

### Change Log

- Installed `@fullcalendar/*` dependency suite
- Created `schedule` dashboard routing endpoint via App Router
- Set up mock data and typings for `Appointment`
- Implemented robust overlapping calculations locally

### Status

status: review

| Rule                  | Detail                                                           |
| --------------------- | ---------------------------------------------------------------- |
| Working hours         | Mon–Fri only, 09:00–18:00                                        |
| Slot duration         | 30 minutes minimum                                               |
| Overlap prevention    | Client-side check: no two appointments for the same time range   |
| Outside-hours booking | Rejected with inline error in modal                              |
| Backend calls         | NONE — all state is local React state initialized from mock data |
| No ShadCN UI          | Only MUI + Tailwind                                              |

---

## Dependencies

- `@fullcalendar/react`, `@fullcalendar/timegrid`, `@fullcalendar/interaction` — must be installed
- Existing packages already available: `@mui/material`, `react-hook-form`, `next-intl`, `zustand`
- Admin dashboard layout (`layout.tsx`) and sidebar (`Sidebar.tsx`) must be updated
- No new Zustand store needed for this story (local state in `Page.tsx` is sufficient for mock-only)

---

## Testing

- [ ] Navigating to `/[locale]/admin/schedule` renders the calendar page
- [ ] Sidebar "Schedule" item is highlighted as active on this route
- [ ] Other sidebar tabs navigate to their routes (or remain no-op for placeholder routes)
- [ ] FullCalendar renders with correct business hours (Mon–Fri, 09:00–18:00)
- [ ] Mock appointments appear in the calendar with correct colors
- [ ] Clicking an empty slot opens the Create modal with pre-filled start time
- [ ] End time is auto-set to start + 30 min
- [ ] Saving creates a new appointment visible in the calendar
- [ ] Clicking an existing event opens Edit modal with pre-filled data
- [ ] Editing saves changes and calendar updates
- [ ] Deleting removes the appointment from the calendar
- [ ] Overlap validation prevents double-booking
- [ ] Outside-hours validation shows an error
- [ ] Drag & drop reschedules the appointment (state updates)
- [ ] Resize extends appointment duration (state updates)
- [ ] No network requests are made (verify in browser DevTools)
- [ ] Page header "New Appointment" button opens Create modal with empty form

---

## Definition of Done

- [ ] FullCalendar packages installed and configured
- [ ] New route `/[locale]/admin/schedule` renders Appointments page
- [ ] Sidebar "Schedule" navigates to the new route using App Router
- [ ] Active tab derived from `usePathname()` — no more local tab state in layout
- [ ] `Appointment` type defined in `types.ts`
- [ ] Mock appointments initialized and rendered in FullCalendar
- [ ] Create appointment flow works (click slot → modal → save → calendar update)
- [ ] Edit/Delete appointment flow works
- [ ] Overlap and business-hours constraints enforced
- [ ] Drag & drop and resize work
- [ ] All form fields have validation with MUI error messages
- [ ] No backend/API calls made
- [ ] Code follows Clean Architecture (presentation layer only)
- [ ] Tailwind logical properties used (no `ml-`/`mr-`)
- [ ] Accessible: keyboard navigation works in modal
- [ ] Dashboard design tokens and styles are consistent with existing pages
