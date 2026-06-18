# Professional Treatment Chart And Visit Model

## Purpose

This document explains how DentiFlow should evolve the current treatment service into a professional dental workflow.

The key rule is:

> A visit represents one clinical session. The treatment chart represents the patient's full clinical state across all visits.

The current implementation is a good MVP base, but the treatment page currently loads only the acts for one visit. A real dental system should show the patient's full treatment history on the teeth model while still keeping each visit/session auditable.

## Current State

Current backend model:

- `visits`
  - One row per appointment/chair-side clinical session.
  - Statuses: `OPEN`, `CONFIRMED`, `CLOSED`, `VOIDED`.

- `treatment_acts`
  - Currently tied directly to one `visit_id`.
  - Represents acts recorded during that visit.
  - Good for simple same-day treatment.

Current frontend behavior:

- Treatment page receives a `visitId`.
- It loads the current visit detail.
- It renders only `treatment_acts` belonging to that visit.

Limitation:

- The doctor does not see previous treatments on the teeth model.
- Planned work from an older visit cannot naturally be completed in a later visit.
- The chart is session-based, not patient-based.

## Target Professional Behavior

The treatment page should show:

- The patient's full tooth-level treatment chart.
- Current visit acts as editable/session-specific records.
- Previous completed acts as read-only clinical history.
- Previous planned or in-progress acts as available work that can be continued/completed in the current visit.

Expected UX:

- Current visit acts are editable.
- Previous completed acts are visible but read-only.
- Previous planned/in-progress acts can be selected and continued in the current visit.
- Cancelled/voided acts are hidden by default but available in audit/history.
- Clicking any tooth marker should show:
  - act name
  - status
  - tooth
  - visit date
  - doctor/assistant if available
  - whether it belongs to the current visit or previous history

## Recommended Data Model

### Keep `visits`

Keep the existing `visits` table as the clinical encounter/session table.

Meaning:

- `OPEN`: session is active and editable.
- `CONFIRMED`: doctor clinically signed off the session.
- `CLOSED`: session is operationally finished, usually after checkout/payment.
- `VOIDED`: session opened by mistake.

### Evolve `treatment_acts`

Add patient-aware and lifecycle-aware fields to `treatment_acts`.

Recommended columns:

```sql
patient_id CHAR(36) NOT NULL
origin_visit_id CHAR(36) NOT NULL
completed_visit_id CHAR(36) NULL
parent_act_id CHAR(36) NULL
```

Meaning:

- `patient_id`: allows loading all treatment acts for a patient across visits.
- `origin_visit_id`: visit where the act was first planned/created.
- `completed_visit_id`: visit where the act was actually completed.
- `parent_act_id`: optional link used when a later visit continues/amends an older planned act.

For backward compatibility:

- Existing `visit_id` can temporarily remain.
- Treat existing `visit_id` as `origin_visit_id` during migration.
- Backfill `patient_id` from `visits.patient_id`.

### Recommended Future Table: `treatment_plan_items`

For a more professional long-term model, add a separate plan table.

```sql
CREATE TABLE treatment_plan_items (
  id CHAR(36) PRIMARY KEY,
  clinic_id CHAR(36) NOT NULL,
  patient_id CHAR(36) NOT NULL,
  act_catalog_id CHAR(36) NOT NULL,
  tooth_fdi VARCHAR(10) NULL,
  surface VARCHAR(50) NULL,
  tooth_part VARCHAR(50) NULL,
  dentition VARCHAR(50) NULL,
  status ENUM('PLANNED', 'IN_PROGRESS', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
  priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
  diagnosis_notes TEXT NULL,
  created_visit_id CHAR(36) NOT NULL,
  completed_visit_id CHAR(36) NULL,
  created_by CHAR(36) NOT NULL,
  completed_by CHAR(36) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_treatment_plan_patient (clinic_id, patient_id),
  INDEX idx_treatment_plan_status (clinic_id, patient_id, status),
  INDEX idx_treatment_plan_tooth (clinic_id, patient_id, tooth_fdi)
);
```

Then `treatment_acts` becomes the visit execution/audit record:

```sql
ALTER TABLE treatment_acts
  ADD COLUMN treatment_plan_item_id CHAR(36) NULL,
  ADD COLUMN action_type ENUM('PLANNED', 'PERFORMED', 'UPDATED', 'CANCELLED') NOT NULL DEFAULT 'PERFORMED';
```

Meaning:

- `treatment_plan_items` is the long-lived clinical intent.
- `treatment_acts` records what happened in a specific visit.

This is closest to how professional clinical systems think:

- A plan item can be created today.
- It can be completed later.
- Every visit still has its own auditable actions.

## Recommended Implementation Path

### Phase 1: Minimal Professional Upgrade

This phase uses the current structure and avoids a big rewrite.

Backend:

1. Add `patient_id` to `treatment_acts`.
2. Add `origin_visit_id` to `treatment_acts`.
3. Add `completed_visit_id` to `treatment_acts`.
4. Backfill:
   - `patient_id` from `visits.patient_id`
   - `origin_visit_id` from current `visit_id`
   - `completed_visit_id` where status is `DONE`
5. Add indexes:

```sql
CREATE INDEX idx_treatment_acts_patient
  ON treatment_acts (clinic_id, patient_id);

CREATE INDEX idx_treatment_acts_patient_tooth
  ON treatment_acts (clinic_id, patient_id, tooth_fdi);

CREATE INDEX idx_treatment_acts_completed_visit
  ON treatment_acts (completed_visit_id);
```

6. Add patient history endpoint:

```txt
GET /api/v1/clinics/:clinicId/patients/:patientId/treatment-acts
```

7. Add optional filters:

```txt
status=PLANNED|IN_PROGRESS|DONE|CANCELLED
tooth_fdi=16
include_voided=false
```

Frontend:

1. Treatment page still opens by `visitId`.
2. Load current visit:

```txt
GET /api/v1/treatment/visits/:visitId
```

3. Use `visit.patient_id` to load patient chart:

```txt
GET /api/v1/clinics/:clinicId/patients/:patientId/treatment-acts
```

4. Render all patient acts on the teeth model.
5. Mark acts as:
   - `currentVisit: true` if act belongs to current visit.
   - `historical: true` if act belongs to another visit.
6. Only allow editing current visit acts.
7. Allow continuing previous `PLANNED` or `IN_PROGRESS` acts into the current visit.

### Phase 2: Treatment Plan Model

Add `treatment_plan_items` and link visit acts to plan items.

Backend:

1. Create `treatment_plan_items`.
2. Add `treatment_plan_item_id` to `treatment_acts`.
3. Add use cases:
   - create treatment plan item
   - continue treatment plan item in current visit
   - complete treatment plan item
   - cancel treatment plan item
4. Add endpoints:

```txt
GET    /api/v1/clinics/:clinicId/patients/:patientId/treatment-plan
POST   /api/v1/clinics/:clinicId/patients/:patientId/treatment-plan
PATCH  /api/v1/treatment-plan/:planItemId
POST   /api/v1/treatment-plan/:planItemId/continue
POST   /api/v1/treatment-plan/:planItemId/complete
```

Frontend:

1. Treatment chart loads plan items and visit acts.
2. Plan items are the primary tooth markers.
3. Visit acts are shown in the current session panel.
4. Previous completed work is read-only.
5. Pending work can be continued in the current visit.

## Visit Completion Rules

Recommended lifecycle:

### `OPEN`

The patient is in chair. Treatment acts can be added, edited, removed, or continued.

### `CONFIRMED`

The doctor has clinically reviewed the visit.

Rules:

- At least one meaningful act should exist, unless visit is voided.
- Current visit acts become locked from casual editing.
- If an act status changed to `DONE`, set `completed_visit_id` to this visit.

### `CLOSED`

The session is operationally finished.

Rules:

- Usually happens after checkout/payment.
- Visit is fully locked.
- Any later correction must be an amendment, not direct editing.

### `VOIDED`

The visit was opened by mistake.

Rules:

- Only allowed if no meaningful treatment acts exist.
- If acts exist, require clinical review or admin correction.

## Treatment Page Display Rules

On the teeth model:

- `DONE` from previous visits:
  - show as completed/read-only.
- `PLANNED` from previous visits:
  - show as pending.
  - allow "continue in this visit".
- `IN_PROGRESS` from previous visits:
  - show as active/pending.
  - allow update or completion in this visit.
- Current visit acts:
  - show strongly.
  - allow edit while visit is `OPEN`.
- `CANCELLED`:
  - hidden by default.
  - visible in audit/history panel.

In the side panel:

- Current Visit tab:
  - only acts created/performed/continued in this visit.
- Patient Chart tab:
  - all active patient treatment items.
- History tab:
  - completed/cancelled/voided items grouped by visit date.

## Important Audit Rules

- Never silently rewrite old completed treatment acts.
- Any correction after confirmation should create an amendment/audit record.
- Price should remain a snapshot on the visit act.
- Catalog price changes should not affect old acts.
- Completed treatment should record who completed it and in which visit.

## Recommended Next Story

Title:

```txt
Upgrade treatment chart to patient-level clinical history
```

Acceptance criteria:

1. Given a patient has treatment acts from previous visits, when the doctor opens today's treatment page, then the teeth model shows previous acts as read-only history.
2. Given a patient has a planned act from a previous visit, when the doctor opens a new visit, then the doctor can continue or complete that act in the current visit.
3. Given an act is completed in a later visit, then the system stores both the original planning visit and the completed visit.
4. Given the current visit is confirmed or closed, then current visit acts cannot be edited directly.
5. Given the patient chart loads, then cancelled/voided acts are hidden by default but available in history/audit.

