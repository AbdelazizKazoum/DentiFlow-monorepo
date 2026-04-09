---
stepsCompleted:
  [
    /* Lines 4-18 omitted */
  ]
workflowStatus: complete
completedAt: "2026-04-07"
outputFile: docs/planning-artifacts/prd.md
inputDocuments: [docs/planning-artifacts/product-brief-dentilflow-frontend.md]
workflowType: "prd"
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: saas_b2b
  /* Lines 30-32 omitted */
  projectContext: greenfield
---

# Product Requirements Document - dentilflow-frontend

**Author:** Abdelaziz
**Date:** 2026-04-07

## Executive Summary

DentilFlow is a cloud-based dental clinic management SaaS purpose-built for the Maghreb and MENA region. It addresses a complete market gap: every incumbent dental SaaS solution (Dentrix, Curve Dental, CareStack, Eaglesoft) serves the US/Canadian market in English only — the Arabic and French-speaking North African market is entirely unserved.

The platform connects five user roles through a unified, real-time workflow: patients book appointments online in Arabic, French, or English; secretariat staff manage the full appointment lifecycle and waiting room from a clean operational dashboard; dental assistants record chair-side treatment acts; doctors access their schedule, patient context, and confirm treatments in real time; and clinic admins configure the system and oversee operations.

**Target users:** Dental clinics in Algeria, Morocco, and Tunisia — with the secretariat as the primary daily operator, doctors as real-time consumers, and patients as the self-service activation channel. Secondary: broader MENA and Francophone Africa.

**Business model:** Monthly SaaS subscription per clinic. Single pricing tier at MVP; multi-tier and multi-tenant architecture planned for V2.

### What Makes This Special

DentilFlow's moat is **localization as infrastructure, not translation as afterthought.** Arabic RTL, French, and English are first-class citizens in the UI architecture — not bolt-ons. No existing dental SaaS player offers this; building it correctly creates a multi-year lead that a US-market competitor cannot close cheaply.

The second edge is **workflow fit for the Maghrebi secretariat.** US dental SaaS is designed for US practice managers. DentilFlow's UX is designed around the actual orchestration pattern of a North African clinic front office — different handoff points, different communication channels (WhatsApp over email), different scheduling norms.

Core insight: the barrier to adoption in this market is not price or awareness — it is the total absence of a product that works in the languages and workflows of the market.

### Project Classification

| Attribute       | Value                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Project Type    | SaaS B2B (B2B2C)                                                                                    |
| Domain          | Healthcare — Dental Clinic Management                                                               |
| Complexity      | High — regulated patient data, cross-national compliance (PDPC/CNDP/INPDP/GDPR), trilingual RTL+LTR |
| Project Context | Greenfield                                                                                          |

## Success Criteria

### User Success

- **Patient activation:** Patient completes first self-booking without staff assistance — the "midnight booking" moment realized.
- **Secretariat adoption:** Secretary manages ≥80% of daily appointment intake (walk-in, phone, online) and waiting room queue through the platform within 30 days of onboarding.
- **Doctor workflow:** Doctor records treatment acts for ≥90% of completed visits within the platform — zero paper fallback.
- **Waiting room clarity:** Doctor and secretary see real-time patient queue status (Arrived → Waiting → In Chair → Done) without verbal check-ins.
- **Checkout completion:** Each visit closes with a documented act summary, payment status, and optional next appointment — no open-ended visits.
- **Notification delivery:** Appointment confirmation and reminder delivered via WhatsApp and/or email within 2 minutes of booking confirmation.
- **Multilingual usability:** Users complete all core workflows entirely in their preferred language (Arabic RTL, French, or English) without language fallback.

### Business Success

- **Month 3:** 5 paying clinics onboarded in Algeria and/or Morocco.
- **Month 6:** 15 paying clinics; ≥40% of appointment intake via platform channels; ≥70% of visits with treatment records documented in-platform.
- **Month 12:** 40+ paying clinics; monthly churn ≤5%; secretariat DAU ≥70% of active clinic accounts.
- **Unit economics:** Customer acquisition cost recoverable within 3 months of subscription start.

### Technical Success

- **Uptime:** ≥99.5% availability during clinic business hours.
- **Real-time performance:** All waiting room queue updates reflect within 3 seconds across secretary and doctor screens.
- **Data compliance:** Patient data stored and processed in compliance with Algeria PDPC, Morocco Law 09-08 / CNDP, Tunisia INPDP, and GDPR — prior to commercial launch.
- **Role-based access:** Zero unauthorized cross-role data access incidents — enforced at API layer.

### Measurable Outcomes

| Outcome                                            | Signal                       | Target                       |
| -------------------------------------------------- | ---------------------------- | ---------------------------- |
| Platform replaces phone as primary booking channel | % appointments booked online | ≥40% by month 6              |
| Treatment documentation adoption                   | % visits with recorded acts  | ≥90% by month 6              |
| Secretariat workflow adoption                      | DAU / active clinic accounts | ≥70% by month 12             |
| Clinic retention                                   | Monthly churn rate           | ≤5%                          |
| Early traction                                     | Paid clinics                 | 5 by month 3, 40 by month 12 |

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Full-platform launch — all core clinical workflows shipped together. The treatment record and checkout are the core differentiator; shipping appointment booking without them would not demonstrate the product's value to clinic owners.
**Resource Requirements:** Full-stack MERN team; Next.js frontend with i18n/RTL capability; real-time backend (WebSocket/SSE); WhatsApp Business API integration.

### MVP Feature Set (Phase 1)

**Must-Have Capabilities:**

- JWT authentication — 5 roles: Patient, Secretariat, Dental Assistant, Doctor, Admin
- Appointment management — 3 intake channels (online, walk-in, phone) + confirmation/reminder notifications (WhatsApp + email)
- Real-time waiting room queue: Arrived → Waiting → In Chair → Done (secretary full, doctor own queue, dental assistant read-only)
- Real-time slot conflict prevention for concurrent bookings
- Clinical treatment records — act entry (FDI tooth number + procedure + price), dental assistant entry with doctor confirmation, visit total calculation
- Act catalog — Admin-managed list of procedures with default prices
- Checkout — visit summary, full/partial payment, balance carry-forward, next appointment scheduling
- Patient records — demographics, appointment history, treatment history, account balance
- Admin panel — staff management, clinic configuration, working hours
- Trilingual UI — Arabic (RTL), French, English — mobile-responsive web

### Post-MVP Features

**Phase 2 — Growth:**

- Multi-clinic / multi-tenant architecture (V2 priority)
- Advanced analytics: utilization, no-show rates, revenue by doctor/procedure
- Online payment processing (deposit or full payment at booking)
- Patient self-service: rescheduling, cancellation, balance/history view
- Dental charting visualization (tooth map UI)
- Waitlist management
- Multi-tiered subscription pricing

**Phase 3 — Expansion:**

- Adjacent medical specialties (ophthalmology, general practice)
- Native mobile apps (iOS and Android)
- Dental supply chain / inventory management
- Inter-clinic referral network
- Regional dental association distribution partnerships

### Risk Mitigation Strategy

**Technical Risks:** Real-time waiting room sync (WebSocket/SSE) and Arabic RTL layout correctness are the highest-risk implementation areas. Mitigated by: early prototype of real-time queue in sprint 1; RTL automated visual regression tests from day one.
**Market Risks:** Clinic adoption speed in a market with no prior SaaS habit. Mitigated by: secretary-first onboarding (lowest friction role); Arabic + French onboarding flow; hands-on support for first 5 clinics.
**Resource Risks:** WhatsApp Business API approval timeline is external and unpredictable. Mitigated by: email as full-featured fallback; approval process started at build kickoff, not pre-launch.

## User Journeys

### Journey 1: Yasmine — The Patient (Online Self-Booking, Success Path)

Yasmine is a 28-year-old teacher in Algiers. She's had a toothache for three days but hasn't called the clinic because she doesn't have time during her school day and forgets by evening. On Tuesday at 11pm, she remembers. She opens her phone, finds DentilFlow, switches the interface to Arabic, and searches for her dentist — Dr. Benali's clinic. She sees available slots for Thursday morning. She books the 9am slot in under two minutes. No call. No waiting.

Thursday morning her WhatsApp buzzes: a reminder in Arabic. She arrives at the clinic, tells the secretary her name. The secretary sees her on the waiting room screen — status flips to "Arrived." Yasmine waits. When the doctor is ready, her status moves to "In Chair." After treatment, she goes to checkout, the secretary shows her the total for the procedure performed, she pays in full, and the receipt shows zero balance. On her way out she books a follow-up three weeks later — from the checkout screen, in 30 seconds.

**Capabilities revealed:** Patient registration, online booking flow, WhatsApp notifications, waiting room status display (patient arrival), checkout with payment, next appointment scheduling.

---

### Journey 2: Fatima — The Secretary (Full Daily Workflow, Walk-in + Phone + Online)
