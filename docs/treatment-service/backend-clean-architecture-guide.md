# Treatment Service Backend Clean Architecture Guide

This guide explains how to implement `services/treatment-service` using the same architecture already used by `appointment-service`, `patient-service`, `clinic-service`, and `auth-service`.

The backend stack is:

```text
NestJS
TypeORM
MySQL
gRPC
NATS outbox relay
Clean Architecture layers
```

## 1. Service Boundary

### Treatment Service Owns

- act catalog
- clinical visits
- treatment acts
- patient-level treatment plan items
- visit lifecycle rules
- treatment act mutation rules
- treatment total recalculation
- treatment outbox events

### Treatment Service Does Not Own

- queue status
- appointments
- patient profile data
- auth users
- staff profiles
- invoices/payments

Use cross-service IDs and snapshots:

```text
appointment_id -> appointment-service
patient_id     -> patient-service
doctor_id      -> auth-service / clinic-service
assistant_id   -> auth-service / clinic-service
```

Do not SQL-join across service databases.

## 2. Required Service Folder Structure

Create:

```text
services/treatment-service/
├── src/
│   ├── application/
│   │   ├── ports/
│   │   └── use-cases/
│   ├── domain/
│   │   ├── entities/
│   │   ├── enums/
│   │   └── repositories/
│   ├── infrastructure/
│   │   ├── grpc/
│   │   ├── nats/
│   │   └── persistence/
│   │       ├── entities/
│   │       ├── mappers/
│   │       ├── migrations/
│   │       └── repositories/
│   ├── presentation/
│   │   ├── grpc/
│   │   └── health/
│   ├── shared/
│   │   └── constants/
│   ├── treatment/
│   │   └── treatment.module.ts
│   ├── app.module.ts
│   └── main.ts
```

This is intentionally the same pattern as:

```text
services/appointment-service/src
services/patient-service/src
```

## 3. Domain Layer

Domain files should be plain TypeScript. No NestJS decorators, no TypeORM decorators, no transport DTOs.

### Enums

Create:

```text
src/domain/enums/visit-status.enum.ts
src/domain/enums/treatment-act-status.enum.ts
src/domain/enums/tooth-surface.enum.ts
src/domain/enums/tooth-part.enum.ts
src/domain/enums/dentition.enum.ts
```

Example:

```typescript
export enum VisitStatus {
  OPEN = "OPEN",
  CONFIRMED = "CONFIRMED",
  CLOSED = "CLOSED",
  VOIDED = "VOIDED",
}
```

### Entities

Create:

```text
src/domain/entities/act-catalog.ts
src/domain/entities/visit.ts
src/domain/entities/treatment-act.ts
src/domain/entities/outbox-event.ts
```

Keep them immutable constructor classes like existing backend entities.

Example:

```typescript
export class Visit {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly appointmentId: string,
    public readonly patientId: string,
    public readonly patientName: string,
    public readonly doctorId: string,
    public readonly doctorName: string,
    public readonly assistantId: string | null,
    public readonly assistantName: string | null,
    public readonly status: VisitStatus,
    public readonly totalAmount: number,
    public readonly confirmedAt: Date | null,
    public readonly confirmedBy: string | null,
    public readonly voidedAt: Date | null,
    public readonly voidReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
```

### Repository Interfaces

Create:

```text
src/domain/repositories/act-catalog-repository.interface.ts
src/domain/repositories/visit-repository.interface.ts
src/domain/repositories/treatment-act-repository.interface.ts
src/domain/repositories/outbox-repository.interface.ts
```

Suggested visit repository:

```typescript
export interface IVisitRepository {
  findById(id: string): Promise<Visit | null>;
  findActiveByAppointmentId(appointmentId: string): Promise<Visit | null>;
  listOpenByClinic(clinicId: string, doctorId?: string): Promise<Visit[]>;
  create(input: OpenVisitInput): Promise<Visit>;
  assignAssistant(
    visitId: string,
    assistantId: string,
    assistantName: string,
  ): Promise<Visit>;
  updateTotalAmount(visitId: string, totalAmount: number): Promise<void>;
  confirm(visitId: string, confirmedBy: string): Promise<Visit>;
  close(visitId: string): Promise<Visit>;
  void(visitId: string, reason: string): Promise<Visit>;
}
```

## 4. Application Layer

Use Nest `@Injectable()` use cases and injection tokens, same as existing services.

Create:

```text
src/application/use-cases/manage-act-catalog.use-case.ts
src/application/use-cases/manage-visits.use-case.ts
src/application/use-cases/manage-treatment-acts.use-case.ts
```

Optional cross-service workflow use case if this service directly handles queue workflows:

```text
src/application/use-cases/manage-treatment-workflows.use-case.ts
```

However, if the API gateway orchestrates queue + treatment, keep this service focused on treatment APIs only.

### ManageVisitsUseCase

Responsibilities:

- open/reuse visit
- assign assistant
- confirm visit
- close visit
- void visit
- get visit detail
- list open visits
- write outbox events

Important comments to include in code:

```typescript
/**
 * Opens or reuses an active visit for an appointment.
 * VOIDED visits are audit records and do not block creating a later real visit.
 */
```

### ManageTreatmentActsUseCase

Responsibilities:

- add treatment act
- update treatment act
- remove treatment act
- recalculate visit total after every mutation
- block edits unless visit is `OPEN`
- write outbox events

Important comments to include in code:

```typescript
/**
 * unitPrice is a snapshot copied from the act catalog at creation time.
 * Never accept unitPrice from client input and never update it later.
 */
```

## 5. Infrastructure Layer

### TypeORM Entities

Create:

```text
src/infrastructure/persistence/entities/act-catalog.typeorm-entity.ts
src/infrastructure/persistence/entities/visit.typeorm-entity.ts
src/infrastructure/persistence/entities/treatment-act.typeorm-entity.ts
src/infrastructure/persistence/entities/outbox.typeorm-entity.ts
```

Follow existing naming style:

```typescript
export class VisitTypeOrmEntity {}
```

Use snake_case database columns and map to camelCase domain entities through mappers.

### Mappers

Create:

```text
src/infrastructure/persistence/mappers/act-catalog.mapper.ts
src/infrastructure/persistence/mappers/visit.mapper.ts
src/infrastructure/persistence/mappers/treatment-act.mapper.ts
```

Pattern:

```typescript
export class VisitMapper {
  static toDomain(entity: VisitTypeOrmEntity): Visit {}
}
```

### Repositories

Create:

```text
src/infrastructure/persistence/repositories/act-catalog.repository.ts
src/infrastructure/persistence/repositories/visit.repository.ts
src/infrastructure/persistence/repositories/treatment-act.repository.ts
src/infrastructure/persistence/repositories/outbox.repository.ts
```

Repositories implement domain interfaces. They may throw Nest exceptions for persistence-level conflicts, following existing service style.

### Migrations

Create:

```text
src/infrastructure/persistence/migrations/20260618000001-CreateTreatmentTables.ts
src/infrastructure/persistence/migrations/20260618000002-SeedActCatalog.ts
```

## 6. Presentation Layer

The current backend services expose gRPC controllers. Treatment service should do the same.

Create:

```text
src/presentation/grpc/treatment.grpc-controller.ts
src/presentation/grpc/treatment.grpc-mapper.ts
src/presentation/grpc/rpc-error.helper.ts
src/presentation/health/health.controller.ts
src/presentation/health/health.module.ts
```

Also add:

```text
services/lib/proto/treatment.proto
services/lib/proto/treatment.ts
```

Export it from:

```text
services/lib/proto/index.ts
```

## 7. Treatment Module

Create:

```text
src/treatment/treatment.module.ts
```

It should mirror `AppointmentModule`.

Expected providers:

```typescript
ManageActCatalogUseCase
ManageVisitsUseCase
ManageTreatmentActsUseCase
OutboxRelayService
{ provide: ACT_CATALOG_REPOSITORY, useClass: ActCatalogRepository }
{ provide: VISIT_REPOSITORY, useClass: VisitRepository }
{ provide: TREATMENT_ACT_REPOSITORY, useClass: TreatmentActRepository }
{ provide: OUTBOX_REPOSITORY, useClass: OutboxRepository }
```

Expected TypeORM entities:

```typescript
ActCatalogTypeOrmEntity
VisitTypeOrmEntity
TreatmentActTypeOrmEntity
OutboxTypeOrmEntity
```

## 8. Injection Tokens

Create:

```text
src/shared/constants/injection-tokens.ts
```

```typescript
export const ACT_CATALOG_REPOSITORY = Symbol("ACT_CATALOG_REPOSITORY");
export const VISIT_REPOSITORY = Symbol("VISIT_REPOSITORY");
export const TREATMENT_ACT_REPOSITORY = Symbol("TREATMENT_ACT_REPOSITORY");
export const OUTBOX_REPOSITORY = Symbol("OUTBOX_REPOSITORY");
```

## 9. App Module and Main

Create `app.module.ts` and `main.ts` by copying the structure from `appointment-service` and replacing module names.

The service should import:

```typescript
TreatmentModule
HealthModule
ConfigModule
DatabaseModule
LoggerModule
```

## 10. Business Rules

### Visit Opening

1. A visit is opened when patient enters chair.
2. If an `OPEN` active visit exists for the appointment, return it.
3. If `CONFIRMED` or `CLOSED` exists, reject automatic opening.
4. If only `VOIDED` visits exist, create a new `OPEN` visit.

### Visit Voiding

1. Visit must be `OPEN`.
2. Visit must have zero treatment acts.
3. Set `VOIDED`, `voidedAt`, `voidReason`.
4. Never hard-delete visits.

### Treatment Acts

1. Acts can only mutate while visit is `OPEN`.
2. `unitPrice` is copied from catalog and immutable.
3. Recalculate total after create/update/delete.
4. Exclude `CANCELLED` acts from total.

### Patient-Level Treatment Plans (Phase 2)

Use two models, with different responsibilities:

- `treatment_plan_items` is the durable clinical intent for one patient and one tooth/procedure. It owns the current clinical status.
- `treatment_acts` is an immutable, visit-specific execution/audit event. It links to its plan item through `treatment_plan_item_id`.

For example, a root canal planned in visit A and completed in visit C has **one** plan item with `created_visit_id = A` and `completed_visit_id = C`; it has one or more treatment acts, each linked to the visit in which that part was recorded. This is audit history, not duplicate clinical plans.

Rules:

1. Never move an existing treatment act to a later visit.
2. Continuing work creates a new treatment act for the current open visit and links it to the existing plan item.
3. A plan item becomes `DONE` only with a completing visit and clinician.
4. Corrections after confirmation create an `AMENDED` execution event; they do not rewrite an old performed event.
5. Prices remain snapshots on execution acts. Plan items do not own billable price snapshots.

Required indexes are `(clinic_id, patient_id)`, `(clinic_id, patient_id, status)`, `(clinic_id, patient_id, tooth_fdi)` on plans, and `treatment_plan_item_id` on acts.

### Confirmation

1. A doctor may confirm an open visit even when no billable act was performed (for example, a consultation-only encounter).
2. Set `CONFIRMED`, `confirmedAt`, `confirmedBy`.
3. No further treatment act mutations after confirmation.

### Closing

1. Visit must be `CONFIRMED`.
2. Set `CLOSED`.
3. Emit `visit.closed` for checkout service.

## 11. API Gateway Integration

The frontend currently calls HTTP routes through the API gateway. The gateway should expose REST endpoints and call treatment-service via gRPC.

Keep REST paths aligned with frontend infrastructure repositories:

```text
GET    /api/v1/treatment/visits/:visitId
GET    /api/v1/treatment/visits/by-appointment/:appointmentId
GET    /api/v1/clinics/:clinicId/treatment/visits
POST   /api/v1/clinics/:clinicId/treatment/visits
PATCH  /api/v1/treatment/visits/:visitId/assistant
PATCH  /api/v1/treatment/visits/:visitId/confirm
PATCH  /api/v1/treatment/visits/:visitId/close
PATCH  /api/v1/treatment/visits/:visitId/void
GET    /api/v1/clinics/:clinicId/patients/:patientId/treatment-plan
POST   /api/v1/clinics/:clinicId/patients/:patientId/treatment-plan
GET    /api/v1/treatment/visits/:visitId/acts
POST   /api/v1/treatment/visits/:visitId/acts
PATCH  /api/v1/treatment/acts/:actId
DELETE /api/v1/treatment/acts/:actId
```

The queue + treatment workflow endpoint can live in the API gateway because it coordinates appointment-service queue state and treatment-service visits:

```text
POST  /api/v1/clinics/:clinicId/queue/:queueEntryId/start-treatment
PATCH /api/v1/clinics/:clinicId/queue/:queueEntryId/correct-status
```

## 12. Testing Plan

Follow existing service test style:

```text
manage-visits.use-case.spec.ts
manage-treatment-acts.use-case.spec.ts
manage-act-catalog.use-case.spec.ts
```

Minimum tests:

- open visit creates first `OPEN` visit
- open visit reuses existing `OPEN` visit
- open visit rejects finalized visit
- void visit succeeds only when no acts exist
- add act snapshots catalog price
- update act cannot change unit price
- total recalculates after act mutation
- confirm visit locks an open clinical encounter, including consultation-only visits
- closed/confirmed/voided visits reject act mutation

## 13. Implementation Order

1. Add `treatment.proto` and generated TypeScript output.
2. Scaffold `services/treatment-service`.
3. Add domain enums/entities/repository interfaces.
4. Add TypeORM entities/migrations/mappers/repositories.
5. Add use cases.
6. Add gRPC controller and mapper.
7. Add treatment module/app module/main.
8. Add outbox relay.
9. Add API gateway routes.
10. Point frontend repositories to API mode and verify.
