---
title: "Product Brief: DentilFlow"
status: "draft"
created: "2026-04-07"
updated: "2026-04-07"
inputs: ["user-discovery-session", "competitive-research-getapp-2026"]
---

# Product Brief: DentilFlow

## Dental Clinic Management Platform — Maghreb & MENA

---

## The Problem

Dental clinics across the Maghreb and broader MENA region run on fragmented, manual workflows. Appointments are booked by phone — or not booked at all. Secretaries maintain patient records in ledgers or disconnected spreadsheets. Doctors walk into a consultation room unsure who is waiting or why. And patients, increasingly digital-native, have no way to book, track, or manage their own care outside business hours.

Every established dental software solution — Dentrix, Curve Dental, CareStack, Eaglesoft — serves the US and Canadian market, in English only. **The Maghreb market is completely unserved.**

The result: clinics lose appointments to no-shows, overloaded secretaries become the bottleneck, and patients feel like afterthoughts in their own healthcare.

---

## The Solution

**DentilFlow** is a cloud-based dental clinic management SaaS, purpose-built for the Arabic-speaking, French-speaking, and bilingual markets of the Maghreb and MENA region.

It replaces the phone call and the ledger with a connected, trilingual platform: patients book online in their preferred language (Arabic, French, or English), secretaries manage the full appointment lifecycle from a clean dashboard, and doctors see their schedule and patient context in real time — the moment an appointment is confirmed.

The product delivers two defining "aha moments":

- **For patients:** Booking their first appointment at midnight from their phone, without calling anyone.
- **For doctors and staff:** A secretary creates an appointment and a doctor instantly sees it in their dashboard — no handoff, no paper, no delay.

---

## Target Users

| User                           | Core Need                                            | Key Workflow                                                           |
| ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| **Patients**                   | Frictionless booking, visibility into their own care | Register → Search dentist → Book → Get notified → View history         |
| **Secretariat / Front Office** | Organized daily workflow, less phone time            | Receive requests → Schedule → Confirm → Manage calendar                |
| **Dentist / Doctor**           | Real-time visibility of schedule and patient context | View daily appointments → Access patient records → Manage availability |
| **Clinic Administrator**       | Full operational control, role delegation            | Manage staff roles → Configure clinic → Monitor operations             |

**Primary market:** Algeria, Morocco, Tunisia — French/Arabic bilingual clinic staff and digital-native patient base. Secondary: broader MENA and Francophone Africa.

---

## What Makes DentilFlow Different

**1. Localization as a moat.** Full Arabic RTL support, French, and English — not translations bolted on, but a trilingual-native experience. No current competitor offers this for the dental vertical.

**2. Designed for the secretariat.** Most dental SaaS is built for US practice managers. DentilFlow's primary operator persona is the Maghrebi clinic secretary — the real orchestrator of daily clinic flow. The UX reflects this.

**3. SaaS economics at regional price points.** Monthly per-clinic subscription, priced for Maghreb SMB realities — not the USD pricing of US-market tools inaccessible to North African clinics.

**4. Built modern, built to scale.** Next.js SSR frontend, MERN stack, JWT role-based auth, Docker/Kubernetes infrastructure. Single-clinic MVP architecture designed with multi-tenant SaaS evolution as a first-class concern.

---

## MVP Scope

The initial release delivers the core value loop with zero bloat:

**In scope:**

- Patient and admin authentication (JWT, role-based: Patient / Secretariat / Doctor / Admin)
- Appointment booking system (patient self-service + staff-managed)
- Admin dashboard — appointment CRUD, patient records, schedule management
- Email and WhatsApp notifications — confirmation, reminders (WhatsApp preferred channel in MENA)
- Trilingual UI (Arabic RTL, French, English)

**Explicitly excluded from MVP:**

- Payment processing
- Advanced analytics and reporting
- Multi-clinic / multi-tenant architecture (planned V2)
- Mobile native apps (mobile-responsive web covers MVP)

---

## Business Model

**Monthly SaaS subscription per clinic.** Single pricing tier at MVP — access to full platform for one clinic instance. Multi-tier pricing (by seat count, feature tier, or clinic size) introduced at V2 alongside multi-tenancy.

Revenue strategy: prove unit economics with early clinic adopters in Algeria/Morocco, then expand distribution through regional dental associations and referral programs.

> **Note on compliance:** Patient health data is subject to national data protection laws (Algeria PDPC, Morocco Law 09-08 / CNDP, Tunisia INPDP) and EU GDPR for diaspora patients. Data hosting region and processing agreements must be addressed before commercial launch.

---

## Success Metrics (MVP)

| Metric                                       | Signal                         |
| -------------------------------------------- | ------------------------------ |
| Clinics onboarded (paid)                     | Product-market fit signal      |
| Appointments booked via platform (vs. phone) | Core value delivery            |
| Secretariat daily active usage               | Stickiness / workflow adoption |
| Patient self-booking rate                    | Patient-side activation        |
| Churn rate (monthly)                         | Retention health               |

---

## The 2–3 Year Vision

DentilFlow starts as a clinic management tool and evolves into the **operating system for dental practices in the Maghreb** — a multi-tenant SaaS platform where each subscribing clinic gets its own isolated, configurable workspace. Long-term optionality includes expansion to adjacent medical specialties (ophthalmology, general practice) using the same trilingual, MENA-native platform foundation.

---

## Why Now

- Maghreb internet penetration and smartphone adoption has crossed the inflection point for SaaS adoption
- No competitor is building for this market in Arabic + French
- Next.js, Node.js, and cloud infrastructure make a two-sided clinic platform achievable by a small, focused team
- The platform doubles as a portfolio flagship — demonstrating enterprise-grade architecture and regional product thinking to the global developer market

---

_DentilFlow: The first dental clinic platform built for the Maghreb, in the languages the Maghreb actually uses._
