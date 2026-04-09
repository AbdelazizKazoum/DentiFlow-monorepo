---
stepsCompleted:
  ["validate-prerequisites", "design-epics", "create-stories-epic-0"]
inputDocuments:
  - docs/planning-artifacts/prd.md
  - docs/planning-artifacts/architecture.md
  - docs/planning-artifacts/ux-design-specification.md
---

# dentiflow-menorepo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for dentiflow-menorepo, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: JWT authentication with 5 roles (Patient, Secretariat, Dental Assistant, Doctor, Admin)
FR2: Appointment management with 3 intake channels (online, walk-in, phone) + WhatsApp/email notifications
FR3: Real-time waiting room queue with status transitions (Arrived → Waiting → In Chair → Done)
FR4: Real-time slot conflict prevention for concurrent bookings
FR5: Clinical treatment records with act entry (FDI tooth + procedure + price), assistant entry, doctor confirmation, visit total
FR6: Admin-managed act catalog with default prices
FR7: Checkout with visit summary, payment handling, balance carry-forward, next appointment scheduling
FR8: Patient records (demographics, history, balance)
FR9: Admin panel for staff management, clinic config, working hours
FR10: Trilingual UI (Arabic RTL, French, English) with mobile-responsive web

### NonFunctional Requirements

NFR1: ≥99.5% uptime during clinic business hours
NFR2: Real-time queue updates within 3 seconds across screens
NFR3: Data compliance with PDPC/CNDP/INPDP/GDPR
NFR4: Zero unauthorized cross-role data access (API-enforced RBAC)
NFR5: Complete workflows in preferred language without fallback

### Additional Requirements

- Implement document-level direction with dual Emotion caches for RTL/LTR
- Use SSE + REST mutations + NATS pub/sub for real-time waiting room
- Enforce clinic_id scoping in all DB operations and SSE subscriptions
- MERN stack with Next.js SSR, responsive web-first
- JWT expiry/rotation, TLS, AES-256 encryption, immutable audit logging
- WhatsApp Business API integration with email fallback
- No EMR/EHR or payment gateway in MVP

### UX Design Requirements

UX-DR1: Implement hybrid MUI + Tailwind CSS design system with shared tokens
UX-DR2: Create Patient Mobile Shell and Staff/Admin Dashboard Shell layouts
UX-DR3: Build reusable domain components (queue rows, status chips, quick action bars, localized date-time displays)
UX-DR4: Ensure WCAG 2.1 AA accessibility baseline
UX-DR5: Implement RTL/LTR visual regression testing in CI
UX-DR6: Add dark mode toggle for admin dashboards
UX-DR7: Implement persistent header with instant language switching (Arabic/French/English)
UX-DR8: Create modern landing page with hero, features, testimonials, pricing
UX-DR9: Build patient registration/login with multi-step forms and social login
UX-DR10: Implement appointment booking wizard with calendar widget and real-time updates
UX-DR11: Develop admin dashboard with collapsible sidebar, metrics cards, queue widget, charts
UX-DR12: Create appointment management with calendar/list views, bulk actions
UX-DR13: Build waiting room queue with status controls and doctor tabs
UX-DR14: Implement patient records with search, detail views, and CRUD operations
UX-DR15: Develop treatment records with act entry form and doctor confirmation
UX-DR16: Create act catalog management with CRUD table
UX-DR17: Build checkout & billing with visit summary, payment, invoice generation
UX-DR18: Implement staff management with role-based permissions
UX-DR19: Develop clinic configuration with settings tabs
UX-DR20: Create reports & analytics with metrics and export options

### FR Coverage Map

FR1: Epic 2 - Enables secure access for all users
FR2: Epic 3 - Core patient booking functionality
FR3: Epic 4 - Operational queue management
FR4: Epic 3 - Prevents scheduling conflicts
FR5: Epic 5 - Treatment act recording and confirmation
FR6: Epic 5 - Standardized procedure catalog
FR7: Epic 6 - Visit completion and payment
FR8: Epic 6 - Longitudinal patient data
FR9: Epic 7 - System configuration and oversight
FR10: Epic 0,1 - Multilingual, responsive interface

## Epic List

### Epic 0: Frontend Foundation & Mock Data

Initialize Next.js frontend with modern design system, mock data, and core pages for immediate UI/UX validation.
**FRs covered:** FR10 (trilingual UI)
**UX-DRs covered:** UX-DR1 (design system), UX-DR2 (shells), UX-DR3 (components), UX-DR7 (header/language switching), UX-DR8 (landing page), UX-DR9 (login/register), UX-DR10 (booking wizard), UX-DR11 (dashboard)
**Additional:** Server-side rendering for client pages (SEO), mock data for all interactions

### Epic 1: Platform Foundation

Complete the remaining foundation with auth integration, middleware guards, and admin dashboard post-auth.
**FRs covered:** FR10
**NFRs addressed:** NFR1 (uptime), NFR3 (compliance), NFR5 (language workflows)
**UX-DRs covered:** UX-DR4 (accessibility), UX-DR5 (testing), UX-DR6 (dark mode)
**Additional:** RTL/LTR support, WCAG 2.1 AA, data encryption

### Epic 2: User Onboarding and Authentication

Users can register, login, and manage their profiles across all roles.
**FRs covered:** FR1
**NFRs addressed:** NFR4 (RBAC)
**Additional:** JWT expiry/rotation, role-based access

### Epic 3: Appointment Scheduling and Management

Patients can book appointments online, and clinic staff can manage intake across channels with conflict prevention.
**FRs covered:** FR2, FR4
**UX-DRs covered:** UX-DR12 (appointment management)
**Additional:** WhatsApp/email notifications, real-time slot updates

### Epic 4: Real-Time Clinic Operations

Clinic teams can manage the waiting room queue with live status updates across roles.
**FRs covered:** FR3
**NFRs addressed:** NFR2 (3-second updates)
**UX-DRs covered:** UX-DR13 (waiting room queue)
**Additional:** SSE + NATS pub/sub, clinic_id scoping

### Epic 5: Treatment Documentation

Dental assistants and doctors can record and confirm treatment acts with standardized procedures.
**FRs covered:** FR5, FR6
**UX-DRs covered:** UX-DR15 (treatment records), UX-DR16 (act catalog)
**Additional:** FDI tooth numbering, immutable audit logging

### Epic 6: Patient Care Continuity

Staff can access patient histories, process checkouts, and schedule follow-ups with balance tracking.
**FRs covered:** FR7, FR8
**UX-DRs covered:** UX-DR14 (patient records), UX-DR17 (checkout & billing)
**Additional:** Balance carry-forward, next appointment scheduling

### Epic 7: Clinic Administration

Admins can configure the system, manage staff, and access operational reports.
**FRs covered:** FR9
**UX-DRs covered:** UX-DR18 (staff management), UX-DR19 (clinic config), UX-DR20 (reports)
**Additional:** Working hours, notifications settings

### Epic 8: Backend Services Initialization

Initialize microservices with basic structure, ensure Docker Compose runs correctly, and validate service foundations.
**Additional:** MERN stack setup, shared packages, database connections, basic API endpoints

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 0: Frontend Foundation & Mock Data

Initialize Next.js frontend with modern design system, mock data, and core pages for immediate UI/UX validation.

### Story 0.1: Initialize Next.js Frontend with Design System

As a developer,
I want to set up Next.js 14 with MUI + Tailwind CSS hybrid design system, shared tokens, and animation library,
So that the foundation for modern, animated UI is established.

**Acceptance Criteria:**

**Given** a new Next.js project with TypeScript
**When** MUI, Tailwind, and Framer Motion (for animations) are integrated with shared design tokens
**Then** components can use both systems without conflicts, with smooth transitions and micro-animations
**And** RTL/LTR support is configured at the document level with proper animation handling

### Story 0.2: Create Patient Mobile Shell Layout

As a patient,
I want a responsive mobile-first layout with persistent header, language switching, and subtle animations,
So that I can navigate the patient-facing pages seamlessly in Arabic, French, or English with modern feel.

**Acceptance Criteria:**

**Given** the Next.js app with design system
**When** I access patient pages on mobile/desktop
**Then** the header shows logo, navigation, and instant language dropdown with smooth transitions
**And** page transitions have subtle fade/slide animations
**And** layout adapts responsively with proper direction switching and animation fluidity

### Story 0.3: Build Landing Page with Hero and Sections

As a visitor,
I want to view the clinic's modern landing page with hero, features, testimonials, pricing, and engaging animations,
So that I can understand the service and proceed to booking with a premium experience.

**Acceptance Criteria:**

**Given** server-side rendered page for SEO
**When** I visit the root URL
**Then** I see hero section with compelling headline, animated CTA button, and background elements
**And** sections for features (with hover animations), testimonials (carousel), pricing (interactive cards)
**And** all content displays correctly in selected language with RTL support and smooth scroll animations

### Story 0.4: Implement Appointment Booking Wizard

As a patient,
I want a guided booking flow with calendar widget, form steps, and progress animations,
So that I can easily schedule an appointment with a delightful, modern experience.

**Acceptance Criteria:**

**Given** server-side booking page
**When** I start booking from landing page CTA
**Then** wizard shows animated progress indicator and steps: Select service → Choose date/time (interactive calendar) → Enter details → Confirm
**And** mock data shows available slots with hover effects and prevents conflicts
**And** form validates with animated feedback and shows success confirmation with celebration animation

### Story 0.5: Create Patient Login/Register Pages

As a new/returning patient,
I want multi-step registration and login forms with modern animations and interactions,
So that I can create an account or access my profile with a smooth, professional flow.

**Acceptance Criteria:**

**Given** server-side auth pages
**When** I access login/register
**Then** registration shows animated steps: Personal info → Contact → Preferences with progress visualization
**And** login has email/password with animated "Forgot Password" link
**And** forms include social login buttons with hover animations and mock integration
**And** validation provides animated error messages and success states

### Story 0.6: Develop Admin Dashboard Shell with Sidebar and Header

As an admin/staff,
I want a premium collapsible sidebar dashboard with metrics cards, modern navigation, and dark/light mode,
So that I can access operational views with a pro-platform aesthetic.

**Acceptance Criteria:**

**Given** responsive dashboard layout
**When** I access admin area
**Then** sidebar shows icons + labels with smooth collapse animation and active state highlights
**And** top navbar has search with autocomplete, notifications bell with badge, user dropdown with avatar
**And** main area shows modern metrics cards with subtle shadows, hover effects, and data visualizations
**And** dark/light mode toggle in navbar switches theme instantly with smooth transitions

### Story 0.7: Populate Dashboard with Mock Operational Data

As a secretary,
I want to see realistic mock data in the dashboard components with modern interactions,
So that I can validate the UI/UX for daily operations with premium feel.

**Acceptance Criteria:**

**Given** dashboard shell with dark/light mode
**When** I view the dashboard
**Then** queue widget shows mock patients with animated status chips and smooth transitions
**And** appointment list/table shows mock entries with sorting/filtering and row hover animations
**And** all data is static mock data for UI validation
**And** interactions (status changes) update with animated feedback and maintain theme consistency

## Epic 1: Platform Foundation

Complete the remaining foundation with auth integration, middleware guards, and admin dashboard post-auth.

### Story 1.1: Implement JWT Authentication with Role-Based Access

As the system,
I want JWT-based auth with role claims (Patient, Secretariat, Doctor, Admin) and refresh tokens,
So that users are securely authenticated with appropriate permissions.

**Acceptance Criteria:**

**Given** login/register endpoints
**When** user authenticates
**Then** JWT issued with role, clinic_id, expiry
**And** refresh token rotation implemented
**And** middleware guards enforce role-based access on all routes

### Story 1.2: Add Middleware Guards for Admin Dashboard

As an admin,
I want role-based route protection and session management,
So that only authorized staff access admin features.

**Acceptance Criteria:**

**Given** admin routes
**When** non-admin attempts access
**Then** redirected to login or 403 error
**And** session timeout handled gracefully
**And** logout clears tokens and redirects

### Story 1.3: Integrate Auth with Admin Dashboard

As a staff member,
I want the dashboard to reflect my authenticated state and role,
So that I see role-appropriate navigation and data.

**Acceptance Criteria:**

**Given** authenticated admin/staff
**When** accessing dashboard
**Then** sidebar shows role-specific menu items
**And** user dropdown shows profile options
**And** metrics/data filtered by role permissions

### Story 1.4: Ensure Accessibility Compliance (WCAG 2.1 AA)

As all users,
I want the interface to meet accessibility standards,
So that everyone can use the platform effectively.

**Acceptance Criteria:**

**Given** all pages and components
**When** tested with screen readers and keyboard navigation
**Then** ARIA labels, focus management, and contrast ratios meet WCAG 2.1 AA
**And** RTL/LTR navigation works correctly

### Story 1.5: Implement Dark Mode Toggle System-Wide

As a user,
I want to switch between light and dark themes instantly,
So that I can work comfortably in any lighting.

**Acceptance Criteria:**

**Given** theme toggle in header/navbar
**When** I switch themes
**Then** all components update instantly with smooth transitions
**And** preference persists across sessions
**And** works in both RTL and LTR layouts

### Story 1.6: Add RTL/LTR Visual Regression Testing

As a developer,
I want automated tests for direction-specific layouts,
So that RTL/LTR changes don't break visual consistency.

**Acceptance Criteria:**

**Given** CI pipeline
**When** PR submitted
**Then** visual regression tests run for Arabic RTL and French/English LTR
**And** pixel-perfect comparisons flag any regressions
**And** tests cover critical journeys

## Epic 8: Backend Services Initialization

Initialize microservices with basic structure, ensure Docker Compose runs correctly, and validate service foundations.

### Story 8.1: Initialize Shared Packages (shared-db, shared-logger, shared-config)

As a developer,
I want shared packages for database utilities, logging, and configuration,
So that microservices have consistent foundations.

**Acceptance Criteria:**

**Given** packages/ directory
**When** shared-db, shared-logger, shared-config are created
**Then** they provide TypeORM utilities, Winston logging, and YAML config loading
**And** all services can import and use them

### Story 8.2: Set Up API Gateway with Basic Routing

As the system,
I want an API Gateway for request ingress and JWT verification,
So that all services are protected and routed correctly.

**Acceptance Criteria:**

**Given** services/api-gateway/
**When** NestJS gateway is initialized
**Then** routes to auth-service, clinic-service, etc.
**And** JWT verification middleware is applied
**And** SSE fanout is prepared

### Story 8.3: Initialize Auth Service with Basic Endpoints

As the system,
I want an auth service for user registration and login,
So that authentication is available.

**Acceptance Criteria:**

**Given** services/auth-service/
**When** NestJS service is set up
**Then** /register and /login endpoints work
**And** JWT issuance and role claims implemented
**And** connects to shared-db

### Story 8.4: Configure Docker Compose for Local Development

As a developer,
I want Docker Compose to run all services locally,
So that the full stack starts with one command.

**Acceptance Criteria:**

**Given** docker-compose.yml
**When** docker-compose up executed
**Then** MySQL, NATS, all services start
**And** services connect to each other
**And** hot-reload works for development

### Story 8.5: Validate Service Communication (gRPC + NATS)

As the system,
I want services to communicate via gRPC and NATS,
So that the architecture is solid.

**Acceptance Criteria:**

**Given** running services
**When** auth service calls clinic service via gRPC
**Then** communication succeeds
**And** NATS events are published and consumed
**And** no connection errors
