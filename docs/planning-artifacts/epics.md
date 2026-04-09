---
stepsCompleted: ["validate-prerequisites", "design-epics"]
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

FR1: Epic 1 - Enables secure access for all users
FR2: Epic 2 - Core patient booking functionality
FR3: Epic 3 - Operational queue management
FR4: Epic 2 - Prevents scheduling conflicts
FR5: Epic 4 - Treatment act recording and confirmation
FR6: Epic 4 - Standardized procedure catalog
FR7: Epic 5 - Visit completion and payment
FR8: Epic 5 - Longitudinal patient data
FR9: Epic 6 - System configuration and oversight
FR10: Epic 7 - Multilingual, responsive interface

## Epic List

### Epic 1: User Onboarding and Authentication
Users can register, login, and manage their profiles across all roles (patients, staff, admins).
**FRs covered:** FR1
**NFRs addressed:** NFR4 (RBAC)
**UX-DRs covered:** UX-DR9 (registration/login), UX-DR7 (header with language switching)
**Additional:** JWT expiry/rotation, role-based access

### Epic 2: Appointment Scheduling and Management
Patients can book appointments online, and clinic staff can manage intake across channels with conflict prevention.
**FRs covered:** FR2, FR4
**UX-DRs covered:** UX-DR8 (landing page), UX-DR10 (booking wizard), UX-DR12 (appointment management)
**Additional:** WhatsApp/email notifications, real-time slot updates

### Epic 3: Real-Time Clinic Operations
Clinic teams can manage the waiting room queue with live status updates across roles.
**FRs covered:** FR3
**NFRs addressed:** NFR2 (3-second updates)
**UX-DRs covered:** UX-DR11 (dashboard), UX-DR13 (waiting room queue)
**Additional:** SSE + NATS pub/sub, clinic_id scoping

### Epic 4: Treatment Documentation
Dental assistants and doctors can record and confirm treatment acts with standardized procedures.
**FRs covered:** FR5, FR6
**UX-DRs covered:** UX-DR15 (treatment records), UX-DR16 (act catalog)
**Additional:** FDI tooth numbering, immutable audit logging

### Epic 5: Patient Care Continuity
Staff can access patient histories, process checkouts, and schedule follow-ups with balance tracking.
**FRs covered:** FR7, FR8
**UX-DRs covered:** UX-DR14 (patient records), UX-DR17 (checkout & billing)
**Additional:** Balance carry-forward, next appointment scheduling

### Epic 6: Clinic Administration
Admins can configure the system, manage staff, and access operational reports.
**FRs covered:** FR9
**UX-DRs covered:** UX-DR18 (staff management), UX-DR19 (clinic config), UX-DR20 (reports)
**Additional:** Working hours, notifications settings

### Epic 7: Platform Foundation
The system provides a consistent, accessible, multilingual experience across all features.
**FRs covered:** FR10
**NFRs addressed:** NFR1 (uptime), NFR3 (compliance), NFR5 (language workflows)
**UX-DRs covered:** UX-DR1 (design system), UX-DR2 (shells), UX-DR3 (components), UX-DR4 (accessibility), UX-DR5 (testing), UX-DR6 (dark mode)
**Additional:** RTL/LTR support, WCAG 2.1 AA, responsive web, data encryption

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.