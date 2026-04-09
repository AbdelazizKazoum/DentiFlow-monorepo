---
stepsCompleted: [/* Lines 4-18 omitted */]
lastStep: step-14-complete
workflowStatus: complete
createdAt: "2026-04-07"
updatedAt: "2026-04-09"
completedAt: "2026-04-07"
outputFile: docs/planning-artifacts/ux-design-specification.md
inputDocuments:
  - docs/planning-artifacts/prd.md
  - docs/planning-artifacts/product-brief-dentilflow-frontend.md
workflowType: ux-design
---

# UX Design Specification dentilflow-frontend

**Author:** Abdelaziz
**Date:** 2026-04-07

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

DentilFlow is a trilingual, operations-critical dental clinic platform designed for Morocco and Algeria. The UX vision is to deliver pro-system reliability with locally native usability: patients get frictionless mobile booking in their language, while clinic teams run daily operations through fast, responsive dashboards with clear role boundaries and real-time state visibility.

### Target Users

Primary patient users are mobile-first and need a fast, low-friction booking and notification experience in Arabic, French, or English. Secretariat users are the operational core and require high-efficiency queue and status control. Doctors and assistants need low-latency treatment flow continuity from queue to chair to checkout. Admin users need responsive configuration and oversight views suitable for desktop-first management tasks.

### Key Design Challenges

DentilFlow must reconcile Arabic RTL and French/English LTR behavior without visual or interaction regressions in critical workflows. The system must maintain pro-level operational clarity across multi-role real-time queue states to avoid handoff errors. Notification UX must combine formal clinical trust with friendly human tone, adapted by context while remaining consistent and compliant.

### Design Opportunities

A pro-system interaction model can become a competitive advantage by making the secretary cockpit measurably faster than paper/phone workflows. Mobile-first patient booking can create strong adoption by enabling fast after-hours appointments with confidence in confirmation and reminders. A unified trilingual design language with robust directionality can establish DentilFlow as the first region-native clinical operations experience rather than a translated generic SaaS.

## Core User Experience

### Defining Experience

DentilFlow’s core daily experience centers on secretariat queue and status operations as the highest-frequency action. The UX must feel like a pro clinical operations system: fast state changes, dense but legible information, minimal clicks, and clear role-based responsibilities. The product’s value loop combines this operational core with patient self-booking and downstream checkout continuity.

### Platform Strategy

The platform strategy is confirmed as:

- Patients: mobile-web-first experience optimized for quick booking, reminders, and simple follow-up actions.
- Staff/Admin: responsive web dashboards optimized for desktop/laptop operational use.

Connectivity strategy is currently undecided. Recommended direction: online-first with resilient behavior (reconnect, state recovery, and safe retry) until offline requirements are finalized.

### Effortless Interactions

The “effortless” bar is benchmarked to pro systems:

- Secretary updates queue states in seconds with near-zero cognitive overhead.
- Appointment intake/changes happen with predictable, low-friction flows.
- Patient booking remains short, guided, and confidence-building.
- Critical transitions (Arrived → Waiting → In Chair → Done) are visually obvious and hard to misfire.
- Notifications are automatic, context-aware, and tonally balanced (formal clinical + friendly human).

### Critical Success Moments

DentilFlow has three parallel make-or-break moments:

1. Midnight patient booking success (first self-service activation moment).
2. Secretary–doctor real-time sync confidence (operational trust moment).
3. Fast checkout with balance handling (financial closure and continuity moment).

Failure in any one of these weakens perceived product reliability; excellence in all three creates strong adoption and retention.

### Experience Principles

- Operational clarity first: Every screen must reduce ambiguity in live clinic operations.
- Speed with safety: Fast actions, but with guardrails against high-cost errors.
- Role-native UX: Each role sees only what they need, in the order they need it.
- Localized by design: Arabic RTL and French/English LTR are first-class, not adapted late.
- Confidence through feedback: Every important action returns immediate, clear system confirmation.
- Online-first resilience: Real-time performance is primary, with graceful recovery on unstable networks.

## Desired Emotional Response

### Primary Emotional Goals

- Patient: feel reassured, respected, and in control during booking and follow-up.
- Secretariat: feel calm control under pressure, with confidence that the queue state is always accurate.
- Doctor and dental assistant: feel synchronized, focused, and clinically safe during live treatment flow.
- Admin: feel operationally confident, informed, and in command of clinic configuration and oversight.

Across all roles, the emotional target is professional reliability with human warmth.

### Emotional Journey Mapping

- First encounter: users feel clarity and legitimacy immediately (professional, trustworthy, local-language native).
- Core interaction: users feel speed with control (fast actions, no ambiguity, clear feedback loops).
- Task completion: users feel closure and confidence ("done correctly, nothing was missed").
- Error or disruption moments: users feel informed and protected, not abandoned.
- Return usage: users feel familiarity and reduced cognitive load, reinforcing daily habit formation.

### Micro-Emotions

- Confidence over confusion in all role-critical actions.
- Trust over skepticism through transparent status, permissions, and confirmations.
- Calm over anxiety during queue pressure and checkout transitions.
- Accomplishment over frustration after each completed workflow stage.
- Satisfaction over novelty; delight is subtle and functional rather than decorative.

### Design Implications

- Calm control → Use stable layout regions, predictable interaction patterns, and persistent status visibility.
- Trust and safety → Show explicit confirmation states, audit-friendly language, and role-appropriate access signals.
- Speed confidence → Minimize action depth for high-frequency tasks and provide immediate, contextual feedback.
- Human warmth within professional tone → Use concise, respectful copy with gentle reassurance in notifications and system responses.
- Failure resilience → Prefer explicit recovery messaging and safe retries instead of silent ambiguous states.

### Emotional Design Principles

- Professional first, human always.
- Clarity is emotional safety.
- Real-time transparency builds trust.
- Fast interactions must still feel deliberate and safe.
- Localization should feel native, not translated.
- In high-pressure clinic contexts, calm UX is a product feature.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

- Doctolib: Strong patient booking confidence, clear slot visibility, and low-friction confirmation flow.
- Google Calendar: Fast scheduling primitives, dependable state clarity, and excellent time-based scanning.
- Linear: Dense but readable pro interface, speed-focused workflows, and minimal interaction friction.

### Transferable UX Patterns

Navigation patterns:

- Role-based primary navigation with stable screen anchors.
- Split “today operations” versus “future scheduling” views to reduce cognitive switching.

Interaction patterns:

- One-tap status transitions for high-frequency queue updates.
- Inline edit/confirm flows instead of modal-heavy interactions.
- Immediate feedback after every critical action.

Visual patterns:

- Dense operational tables with strong hierarchy and scan-friendly spacing.
- Color + icon + text redundancy for status communication (including RTL contexts).

### Anti-Patterns to Avoid

- Overly decorative UI that hides operational state.
- Deep multi-step forms for frequent secretary actions.
- Ambiguous queue ownership between roles.
- RTL support as an afterthought (mirrored but semantically broken layouts).
- Silent failures on real-time updates.

### Design Inspiration Strategy

What to adopt:

- Pro-dashboard information hierarchy and rapid status operations.
- High-confidence booking flow with explicit confirmations.

What to adapt:

- Dense operations UI adapted for trilingual RTL/LTR requirements.
- Calendar/schedule patterns adapted for clinic-specific queue lifecycle.

What to avoid:

- Consumer-style playful interactions in mission-critical clinic workflows.
- Any pattern that increases ambiguity in handoffs.

## Design System Foundation

### 1.1 Design System Choice

Use a hybrid themeable system: MUI + Tailwind CSS + design tokens.

### Rationale for Selection

- Best balance of speed versus uniqueness for MVP.
- MUI provides mature, accessible components and strong RTL support for Arabic.
- Tailwind CSS provides fast layout and responsive implementation velocity.
- Shared design tokens preserve consistency across both systems.
- The ecosystem is maintainable and long-term growth.

### Implementation Approach

- Use MUI for complex, interactive components (forms, dialogs, data tables, date/time pickers, validation-heavy flows).
- Use Tailwind CSS for page layout, spacing, responsive behavior, and utility-level styling.
- Establish a single token layer (color, typography, spacing, radius, elevation, motion) consumed by both systems.
- Build role-specific layout shells: Patient Mobile Shell and Staff/Admin Dashboard Shell.
- Create reusable domain components for high-frequency actions such as queue rows, status chips, quick action bars, and localized date-time displays.
- Enforce WCAG 2.1 AA baseline and RTL/LTR visual regression testing in CI.

### Customization Strategy

- Keep base primitives from MUI and customize through tokenized theming rather than ad-hoc overrides.
- Introduce branded wrappers only for domain-critical components where product differentiation matters.
- Define clear component ownership to avoid style collisions (MUI for complex controls, Tailwind for structural styling).
- Centralize localization and role-aware microcopy to preserve formal-clinical yet friendly-human tone.
- Add interaction guardrails for critical state transitions to reduce operational errors.

## 2. Core User Experience

### 2.1 Defining Experience

DentilFlow’s core daily experience centers on secretariat queue and status operations as the highest-frequency action. The UX must feel like a pro clinical operations system: fast state changes, dense but legible information, minimal clicks, and clear role-based responsibilities. The product’s value loop combines this operational core with patient self-booking and downstream checkout continuity.

### 2.2 Modern Design Infusion

To elevate DentilFlow into a contemporary, professional platform, we're infusing modern design principles throughout:

- **Clean, Minimalist Aesthetics:** Use ample white space, subtle shadows, and a refined color palette (blues, whites, and accent colors for actions) to create a sense of calm and professionalism.
- **Typography Hierarchy:** Employ modern fonts like Inter or Roboto for readability, with clear heading scales and body text optimized for screens.
- **Interactive Elements:** Subtle hover effects, smooth transitions, and micro-animations for feedback without distraction.
- **Accessibility First:** High contrast ratios, keyboard navigation, and screen reader support built-in.
- **Mobile-First Responsive:** Fluid layouts that adapt seamlessly from mobile to desktop, prioritizing touch interactions on mobile devices.
- **Dark Mode Option:** For admin dashboards, provide a dark mode toggle to reduce eye strain during long sessions.

### 2.3 Client-Side Pages (Patient Experience)

Modern landing page structure inspired by professional SaaS websites, with persistent header for navigation and language switching.

#### Header (Persistent Across Pages)

- **Logo:** DentilFlow branding on the left.
- **Navigation Menu:** Links to Home, About, Contact, Services (dropdown for dental specialties).
- **Language Dropdown:** Modern dropdown in header allowing instant language switch (Arabic, French, English) with flags/icons. Persists across all pages.
- **Profile/Login:** If logged in, user avatar with dropdown (Profile, Appointments, Logout). If not logged in, prominent "Login" button.
- **Theme Toggle:** Light/Dark mode switcher in header for user preference.
- **Mobile:** Hamburger menu for collapsed navigation.

1. **Landing Page**
   - **Hero Section:** Compelling headline ("Book Your Dental Appointment in Minutes"), subheadline, and primary CTA button ("Book Appointment") that navigates directly to appointment booking page.
   - Features section highlighting key benefits (trilingual, easy booking, real-time updates).
   - Testimonials/social proof from early clinic adopters.
   - Pricing section (simple subscription model for clinics).
   - Footer with contact info, links to privacy/terms, and additional language switcher.

2. **Patient Registration/Login Pages**
   - **Modern Design:** Clean, pro-website style with card-based layouts, subtle gradients, and professional typography.
   - **Login Page:** Email/password fields, "Forgot Password" link, social login options (Google, Facebook), "Sign Up" link.
   - **Registration Page:** Multi-step form with progress indicator: Personal info → Contact → Preferences (language, notifications). Social login integration.
   - **Dark/Light Mode:** Full support with theme toggle in header or page corner.
   - **Accessibility:** High contrast, keyboard navigation, error handling with clear messages.
   - **Mobile Optimized:** Touch-friendly inputs, stacked layout.

3. **Clinic Search & Selection**
   - Map-based or list view of nearby clinics.
   - Filters by location, specialty, ratings.
   - Integrated with header navigation.

4. **Appointment Booking Flow**
   - Accessed via "Book Appointment" button from hero or header.
   - Step-by-step wizard: Select clinic/service → Choose date/time → Enter details → Confirm.
   - Calendar widget with availability visualization.
   - Real-time slot updates and conflict prevention.
   - Required fields: Patient info, contact, service type. Optional: Notes, insurance info.

5. **Patient Dashboard**
   - Accessible via header profile menu.
   - Upcoming appointments with status.
   - Appointment history.
   - Treatment records and invoices.
   - Profile management (edit details, preferences).

6. **Notifications Center**
   - WhatsApp/email integration display.
   - Reminder settings.
   - Accessible via header notifications bell.

### 2.4 Admin-Side Pages (Staff Experience)

Modern dashboard styled like Vuexy template: collapsible sidebar navigation, top navbar with search/notifications/user menu, fully mobile-friendly with responsive design.

#### Core Layout Structure

- **Sidebar (Left):** Fixed width, collapsible with toggle button. Icons + labels for sections: Dashboard, Appointments, Patients, Treatments, Staff, Settings. Active state highlighting, hover effects.
- **Navbar (Top):** Logo, search bar (global search across patients/appointments), notifications bell with badge count, user avatar dropdown (Profile, Settings, Logout). Breadcrumb navigation for deep pages.
- **Main Content Area:** Fluid layout with padding, card-based grids for metrics/widgets, data tables with sorting/filtering/pagination, action buttons (primary/secondary styles).
- **Mobile Adaptation:** Sidebar collapses to overlay, navbar stacks, tables become cards, touch-optimized buttons and gestures.
- **Theme Support:** Light/dark mode toggle in navbar, consistent across all pages.

#### UI Implementation Details

- **Color Palette:** Primary blue (#1976d2), secondary teal (#009688), neutral grays, accent red for errors/actions.
- **Typography:** Inter font family, hierarchy: H1 2rem, H2 1.5rem, body 1rem, captions 0.875rem.
- **Components:** MUI-based buttons, inputs, tables; Tailwind for spacing/grids. Consistent shadows (elevation 1-4), border radius 8px.
- **Interactions:** Hover states with subtle color shifts, click ripples, loading spinners for async actions, toast notifications for confirmations.
- **Accessibility:** ARIA labels, keyboard navigation (Tab/Enter), high contrast mode support, screen reader friendly.

Required pages with detailed UI specs:

1. **Dashboard Overview**
   - **Top Metrics Cards:** 4 cards in grid (Appointments Today, Pending Payments, No-Shows, Revenue). Each with icon, number, trend arrow.
   - **Queue Widget:** Real-time list of today's appointments with status chips (color-coded: Arrived=green, Waiting=yellow, In Chair=blue, Done=gray). One-click status buttons.
   - **Quick Actions Bar:** Floating action button (FAB) for "New Appointment", inline buttons for "Check-in Patient".
   - **Charts:** Simple bar/line charts for daily metrics using MUI Charts.

2. **Appointment Management**
   - **Calendar View:** Full-calendar widget (MUI DatePicker) with drag-and-drop for rescheduling. Color-coded by doctor/status.
   - **List View:** Data table with columns: Date, Time, Patient, Doctor, Status, Actions. Filters dropdown (date range, doctor, status). Bulk select with checkboxes.
   - **Create/Edit Modal:** Form with tabs: Basic Info (patient search/autocomplete), Schedule (date/time picker), Notes. Save/Cancel buttons.
   - **Bulk Actions:** Selected items toolbar with Confirm/Cancel buttons.

3. **Waiting Room Queue**
   - **Patient List:** Card-based list (mobile-friendly) or table. Each row: Patient name, status chip, time arrived, doctor assigned.
   - **Status Controls:** Inline buttons or dropdown for status update. Confirmation dialog for critical changes.
   - **Filters:** By doctor, status. Real-time updates with WebSocket indicators.
   - **Doctor Tabs:** Segmented tabs for each doctor to view their specific queue.

4. **Patient Records**
   - **Search Bar:** Global search with autocomplete suggestions.
   - **Patient Grid/List:** Cards with avatar, name, last visit, balance. Click to open detail modal/drawer.
   - **Detail View:** Tabs: Profile (editable form), Appointments (history table), Treatments (acts list), Billing (balance/invoices).
   - **Actions:** Edit, Add Note, Upload Document buttons.

5. **Treatment Records**
   - **Act Entry Form:** Modal with fields: Patient search, FDI tooth selector (visual tooth map), Procedure dropdown (from catalog), Price input, Notes.
   - **History Table:** Per patient, columns: Date, Procedure, Tooth, Price, Status (Pending/Confirmed).
   - **Doctor Confirmation:** Pending acts with Approve/Reject buttons.

6. **Act Catalog Management**
   - **Catalog Table:** CRUD table with columns: Procedure Name, Default Price, Category. Inline edit or modal.
   - **Add New:** FAB or button opening form modal.
   - **Categories:** Filterable by dental category (e.g., Cleaning, Filling).

7. **Checkout & Billing**
   - **Visit Summary:** Card with patient info, treatment acts table (editable quantities/prices), subtotal/total.
   - **Payment Section:** Payment method selector (Cash/Card), amount input, partial payment toggle.
   - **Invoice Generation:** Preview modal, download/print options.
   - **Next Appointment:** Inline scheduler widget.

8. **Staff Management**
   - **Staff Table:** Columns: Name, Role, Email, Status. Role badges (color-coded).
   - **Add/Edit Modal:** Form with role dropdown, permissions checkboxes, contact info.
   - **Permissions Matrix:** Visual grid for role-based access control.

9. **Clinic Configuration**
   - **Settings Tabs:** General (clinic name/address), Hours (time picker grid for days), Notifications (WhatsApp/email toggles, templates editor).
   - **Working Hours Widget:** Visual calendar for setting availability.

10. **Reports & Analytics**
    - **Metrics Dashboard:** Cards for key KPIs, date range picker.
    - **Charts:** Bar charts for appointments by doctor, line for revenue trends.
    - **Export:** Button for CSV/PDF download.

11. **Settings**
    - **Profile Tab:** Editable user info, avatar upload.
    - **Preferences:** Language dropdown, theme toggle (light/dark).
    - **Security:** Change password form.

All pages enforce consistent modern design: loading skeletons, error boundaries, empty states with illustrations, and progressive enhancement for performance.
