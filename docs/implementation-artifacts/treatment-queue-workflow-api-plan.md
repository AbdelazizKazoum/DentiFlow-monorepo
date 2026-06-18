# Treatment + Queue Workflow API Plan

This note describes how the current frontend mock workflow should evolve when
the real queue and treatment APIs are available. The goal is to keep the UI and
clean architecture stable while avoiding unnecessary network calls.

## Current Frontend Behavior

The waiting room owns the user action:

```text
Start Treatment / Mark as IN_CHAIR
```

The frontend currently coordinates this through an application workflow:

```text
application/workflows/useCases/SeatPatientAndOpenVisitUseCase
```

The workflow:

1. Loads the queue entry.
2. Checks whether the appointment already has an active visit.
3. Blocks if the visit is already `CONFIRMED` or `CLOSED`.
4. Updates queue status to `IN_CHAIR`.
5. Reuses an existing `OPEN` visit or creates a new one.
6. Returns `{ queueEntry, visit }`.
7. The UI navigates to:

```text
/{locale}/admin/visits/{visitId}/treatment
```

The treatment page loads by `visitId`, not by `patientId`.

## Why Visit Creation Is Not Inside Queue

Queue owns waiting-room status:

```text
ARRIVED -> WAITING -> IN_CHAIR -> DONE
```

Treatment owns clinical encounter lifecycle:

```text
OPEN -> CONFIRMED -> CLOSED
VOIDED
```

The action “seat patient and open visit” coordinates both domains, so it belongs
to an application workflow, not inside the queue domain or treatment domain.

## Target Backend API

When the real APIs exist, avoid making the frontend call queue and treatment
endpoints separately for the same user action. Add one backend endpoint for the
workflow.

Recommended endpoint:

```http
POST /api/v1/clinics/:clinicId/queue/:queueEntryId/start-treatment
```

Alternative:

```http
POST /api/v1/queue/:queueEntryId/seat-and-open-visit
```

Response:

```typescript
interface StartTreatmentResponseDTO {
  queue_entry: QueueEntryDTO;
  visit: VisitDTO;
}
```

Backend rules:

1. If no active visit exists, create an `OPEN` visit.
2. If an `OPEN` visit exists, reuse it.
3. If the latest active visit is `CONFIRMED` or `CLOSED`, return a domain error.
4. Ignore previous `VOIDED` visits for active workflow purposes.
5. Return the queue entry and the active visit in one response.

This makes `Start Treatment` one HTTP call from the frontend.

## Correction Workflow API

The waiting room can correct a patient away from `IN_CHAIR`.

Recommended endpoint:

```http
PATCH /api/v1/clinics/:clinicId/queue/:queueEntryId/correct-status
```

Request:

```typescript
interface CorrectQueueStatusRequestDTO {
  status: QueueStatus;
  correction_reason: string;
}
```

Response:

```typescript
interface CorrectQueueStatusResponseDTO {
  queue_entry: QueueEntryDTO;
  visit?: VisitDTO;
}
```

Backend rules:

1. If moving away from `IN_CHAIR`, find the active visit by appointment.
2. If no visit exists, only correct the queue status.
3. If the visit is `OPEN` and has no treatment acts, mark it `VOIDED`.
4. If the visit has treatment acts, block the correction and require clinical review.
5. Do not hard-delete visits.

## Frontend Repository Shape After API Exists

Keep the current use case names, but replace internal orchestration with a
workflow repository.

Suggested domain contract:

```text
src/domain/workflows/repositories/ClinicalWorkflowRepository.ts
```

```typescript
export interface ClinicalWorkflowRepository {
  startTreatment(queueEntryId: string): Promise<{
    queueEntry: QueueEntry;
    visit: Visit;
  }>;

  correctQueueStatus(command: UpdateQueueStatusCommand): Promise<{
    queueEntry: QueueEntry;
    visit?: Visit;
  }>;
}
```

Suggested infrastructure implementation:

```text
src/infrastructure/workflows/repositories/clinicalWorkflow.repository.ts
```

The existing workflow use cases can then call this repository instead of
coordinating `QueueRepository` and `VisitRepository` directly.

## Treatment Workspace Loading

The treatment page should continue to load by visit id:

```text
GET /api/v1/treatment/visits/:visitId
```

Current frontend behavior:

1. Load visit detail by `visitId`.
2. Derive `patientId` from the visit.
3. Load the full patient record from the patient domain.

This is clean and acceptable.

Optional future optimization:

```http
GET /api/v1/treatment/visits/:visitId/workspace
```

Response:

```typescript
interface TreatmentWorkspaceDTO {
  visit: VisitDTO;
  treatment_acts: TreatmentActDTO[];
  act_catalog: ActCatalogDTO[];
  patient_summary: PatientSummaryDTO;
}
```

Use this only as a read model optimization. Do not make the core `Visit` entity
own the full patient object.

## Frontend Migration Steps

When the API is ready:

1. Add `ClinicalWorkflowRepository` in the domain layer.
2. Add `ClinicalWorkflowHttpRepository` in infrastructure.
3. Update `infrastructure/workflows/container.ts` to use the HTTP workflow repo.
4. Keep `queueStore.startTreatment` returning `{ entry, visit }`.
5. Keep `TreatmentPage` route as:

```text
/{locale}/admin/visits/{visitId}/treatment
```

6. Keep treatment acts attached to `visitId`.

This preserves the UI and application API while improving backend performance.
