# Treatment Service Backend Implementation Guide

This guide describes how to implement `services/treatment-service` so it can replace the frontend in-memory treatment repositories. It follows the existing backend architecture already used by `appointment-service` and `patient-service`; do not introduce a different folder style.

## 1. Existing Backend Architecture To Follow

The microservices under `services/` use a NestJS monorepo with shared infrastructure from `services/lib`.

Patterns observed in the existing services:

- Service root: `services/<name>-service`
- Layers:
  - `src/domain`: entities, enums, repository interfaces
  - `src/application`: use cases and ports
  - `src/infrastructure`: TypeORM persistence, gRPC clients, NATS/outbox when needed
  - `src/presentation`: gRPC controllers, mappers, health controller
  - `src/<bounded-context>`: Nest module wiring repositories/use cases/controllers
  - `src/shared/constants/injection-tokens.ts`: DI tokens
- Persistence:
  - TypeORM entities use snake_case DB columns.
  - Domain entities use camelCase.
  - Infrastructure mappers convert TypeORM entity <-> domain entity.
  - Migrations are explicit TypeORM migration files.
- Transport:
  - gRPC proto files live in `services/lib/proto`.
  - Generated proto TS files are committed under `services/lib/proto/*.ts`.
  - Controllers use `@GrpcMethod`.
  - Controllers map gRPC DTO <-> application inputs.
- Configuration:
  - `src/app.module.ts` uses `ConfigModule.forRoot({validationSchema})`, `LoggerModule`, `DatabaseModule.forRoot()`, bounded-context module, and `HealthModule`.
  - `src/main.ts` connects the gRPC microservice with the service proto path.
- Testing:
  - Use case tests live beside use cases.
  - Shared Jest setup and service-specific `jest.config.ts` are used.

## 2. Goal

Implement a backend treatment microservice that owns the clinical treatment workflow currently simulated in frontend in-memory repositories:

- Create or reuse a visit when a queue patient is seated/in chair.
- Load the treatment workspace for `{clinicId, patientId, activeVisitId}`.
- Create treatment plan items.
- Create grouped treatment plans for groupable acts.
- Start treatment during a visit.
- Complete visit procedures.
- Change treatment plan status.
- Create diagnoses.
- Save clinical attachments metadata.
- Save visit handoff notes.
- Close a visit and create follow-up/document requests.

The backend service must become the implementation behind the frontend contracts currently represented by:

- `frontend/src/domain/treatment/repositories/TreatmentRepository.ts`
- `frontend/src/domain/treatment/repositories/VisitWorkflowRepository.ts`
- `frontend/src/application/treatment/useCases/*`
- `frontend/src/presentation/admin/treatment/store/useTreatmentWorkspaceStore.ts`

## 3. Service Folder Structure

Create or complete this structure under `services/treatment-service`:

```text
services/treatment-service/
├── Dockerfile
├── jest.config.ts
├── jest.setup.ts
├── tsconfig.json
├── tsconfig.test.json
└── src/
    ├── app.module.ts
    ├── main.ts
    ├── treatment/
    │   └── treatment.module.ts
    ├── domain/
    │   ├── entities/
    │   │   ├── clinical-attachment.ts
    │   │   ├── diagnosis.ts
    │   │   ├── treatment-act.ts
    │   │   ├── treatment-charge.ts
    │   │   ├── treatment-group.ts
    │   │   ├── treatment-plan-item.ts
    │   │   ├── visit.ts
    │   │   ├── visit-handoff.ts
    │   │   └── visit-procedure.ts
    │   ├── enums/
    │   │   ├── clinical-attachment-type.enum.ts
    │   │   ├── diagnosis-certainty.enum.ts
    │   │   ├── diagnosis-evidence.enum.ts
    │   │   ├── diagnosis-severity.enum.ts
    │   │   ├── diagnosis-status.enum.ts
    │   │   ├── dentition-mode.enum.ts
    │   │   ├── document-request-type.enum.ts
    │   │   ├── follow-up-urgency.enum.ts
    │   │   ├── treatment-priority.enum.ts
    │   │   ├── treatment-status.enum.ts
    │   │   ├── visit-coding-status.enum.ts
    │   │   ├── visit-procedure-status.enum.ts
    │   │   └── visit-status.enum.ts
    │   └── repositories/
    │       ├── clinical-attachment-repository.interface.ts
    │       ├── diagnosis-repository.interface.ts
    │       ├── treatment-billing-repository.interface.ts
    │       ├── treatment-repository.interface.ts
    │       └── visit-workflow-repository.interface.ts
    ├── application/
    │   ├── ports/
    │   │   ├── appointment-service.port.ts
    │   │   ├── patient-service.port.ts
    │   │   └── clinic-service.port.ts
    │   └── use-cases/
    │       ├── manage-treatment-workspace.use-case.ts
    │       ├── manage-treatment-workspace.use-case.spec.ts
    │       ├── manage-visit-workflow.use-case.ts
    │       └── manage-visit-workflow.use-case.spec.ts
    ├── infrastructure/
    │   ├── grpc/
    │   │   ├── appointment-grpc-client.module.ts
    │   │   ├── appointment-service-grpc.adapter.ts
    │   │   ├── patient-grpc-client.module.ts
    │   │   ├── patient-service-grpc.adapter.ts
    │   │   ├── clinic-grpc-client.module.ts
    │   │   ├── clinic-service-grpc.adapter.ts
    │   │   └── tokens.ts
    │   ├── nats/
    │   │   └── outbox-relay.service.ts
    │   └── persistence/
    │       ├── data-source.ts
    │       ├── entities/
    │       │   ├── clinical-attachment.typeorm-entity.ts
    │       │   ├── diagnosis.typeorm-entity.ts
    │       │   ├── outbox.typeorm-entity.ts
    │       │   ├── treatment-act.typeorm-entity.ts
    │       │   ├── treatment-charge.typeorm-entity.ts
    │       │   ├── treatment-group.typeorm-entity.ts
    │       │   ├── treatment-plan-item.typeorm-entity.ts
    │       │   ├── visit.typeorm-entity.ts
    │       │   ├── visit-handoff.typeorm-entity.ts
    │       │   └── visit-procedure.typeorm-entity.ts
    │       ├── mappers/
    │       │   ├── clinical-attachment.mapper.ts
    │       │   ├── diagnosis.mapper.ts
    │       │   ├── treatment-act.mapper.ts
    │       │   ├── treatment-charge.mapper.ts
    │       │   ├── treatment-group.mapper.ts
    │       │   ├── treatment-plan-item.mapper.ts
    │       │   ├── visit.mapper.ts
    │       │   ├── visit-handoff.mapper.ts
    │       │   └── visit-procedure.mapper.ts
    │       ├── migrations/
    │       │   └── 20260703000001-CreateTreatmentTables.ts
    │       └── repositories/
    │           ├── clinical-attachment.repository.ts
    │           ├── diagnosis.repository.ts
    │           ├── outbox.repository.ts
    │           ├── treatment-billing.repository.ts
    │           ├── treatment.repository.ts
    │           └── visit-workflow.repository.ts
    ├── presentation/
    │   ├── grpc/
    │   │   ├── rpc-error.helper.ts
    │   │   ├── treatment.grpc-controller.ts
    │   │   └── treatment.grpc-mapper.ts
    │   └── health/
    │       ├── health.controller.ts
    │       └── health.module.ts
    └── shared/
        └── constants/
            └── injection-tokens.ts
```

Do not put persistence DTOs or TypeORM entities in `domain`. Domain must stay framework-agnostic.

## 4. Domain Model

Mirror the frontend treatment domain model, but implement backend entities as classes/interfaces in `services/treatment-service/src/domain/entities`.

Core entities:

- `Visit`
- `TreatmentAct`
- `TreatmentPlanItem`
- `TreatmentGroup`
- `VisitProcedure`
- `Diagnosis`
- `ClinicalAttachment`
- `VisitHandoff`
- `TreatmentCharge`
- `FollowUpRequest`
- `MedicalDocumentRequest`

The frontend currently stores follow-up and document request types in `CoordinationRequest.ts`. In backend, either:

- model them as dedicated domain entities and TypeORM tables, or
- keep them under coordination request files if that matches naming better.

Use dedicated tables because they have different workflow meanings.

## 5. Repository Interfaces

Create repository interfaces in `src/domain/repositories`. Keep them close to the frontend contracts, but backend-oriented.

### `visit-workflow-repository.interface.ts`

```ts
export interface CreateVisitFromQueueInput {
  clinicId: string;
  patientId: string;
  queueEntryId: string;
  appointmentId?: string | null;
  chairId: string;
  providerId: string;
  startedAt?: Date;
}

export interface IVisitWorkflowRepository {
  createVisit(input: CreateVisitFromQueueInput): Promise<Visit>;
  findById(id: string): Promise<Visit | null>;
  findActiveByPatient(clinicId: string, patientId: string): Promise<Visit | null>;
  findByQueueEntry(clinicId: string, queueEntryId: string): Promise<Visit | null>;
  updateStatus(visitId: string, status: VisitStatus, changedBy: string): Promise<Visit>;
  saveHandoff(handoff: VisitHandoff): Promise<VisitHandoff>;
  markHandoffCoded(handoffId: string, codedBy: string): Promise<VisitHandoff>;
  closeVisit(input: CloseVisitInput): Promise<Visit>;
  createFollowUpRequest(input: FollowUpRequest): Promise<FollowUpRequest>;
  createDocumentRequest(input: MedicalDocumentRequest): Promise<MedicalDocumentRequest>;
}
```

### `treatment-repository.interface.ts`

```ts
export interface TreatmentWorkspace {
  activeVisit?: Visit;
  acts: TreatmentAct[];
  treatmentPlan: TreatmentPlanItem[];
  currentSession: VisitProcedure[];
  diagnoses: Diagnosis[];
  attachments: ClinicalAttachment[];
  charges: TreatmentCharge[];
  handoffs: VisitHandoff[];
  followUpRequests: FollowUpRequest[];
  documentRequests: MedicalDocumentRequest[];
}

export interface GetTreatmentWorkspaceQuery {
  clinicId: string;
  patientId: string;
  activeVisitId?: string;
}

export interface ITreatmentRepository {
  getWorkspace(query: GetTreatmentWorkspaceQuery): Promise<TreatmentWorkspace>;
  getTreatmentPlanItem(id: string): Promise<TreatmentPlanItem | null>;
  saveTreatmentPlanItems(items: TreatmentPlanItem[]): Promise<TreatmentPlanItem[]>;
  updateTreatmentPlanItem(id: string, patch: Partial<TreatmentPlanItem>): Promise<TreatmentPlanItem>;
  saveTreatmentGroup(group: TreatmentGroup): Promise<TreatmentGroup>;
  saveVisitProcedure(procedure: VisitProcedure): Promise<VisitProcedure>;
  updateVisitProcedure(id: string, patch: Partial<VisitProcedure>): Promise<VisitProcedure>;
}
```

Create separate repositories for diagnosis, attachments, and billing if the implementation gets large. The service module can inject multiple repositories into one use case, following the existing appointment use case pattern.

## 6. Application Use Cases

Use the existing style: one injectable use-case class can orchestrate multiple repository calls.

### `ManageVisitWorkflowUseCase`

Responsibilities:

- `createVisitFromQueue(input)`
  - Check existing visit for `{clinicId, queueEntryId}`.
  - If it exists, return it.
  - Check active visit for `{clinicId, patientId}`.
  - If it exists, return it.
  - Create a new `OPEN` visit with `source = QUEUE`.
  - Add outbox event `treatment.visit.created`.
- `getVisit(id)`
- `saveVisitHandoff(input)`
- `markHandoffNeedsCoding(visitId, providerId)`
- `markHandoffCoded(handoffId, codedBy)`
- `closeVisit(input)`
  - Validate visit is `OPEN` or `NEEDS_CODING`.
  - Save follow-up/document requests if present.
  - Set visit `CLOSED` and `closedAt`.
  - Add outbox event `treatment.visit.closed`.

### `ManageTreatmentWorkspaceUseCase`

Responsibilities:

- `getWorkspace(query)`
- `createTreatmentPlanItems(input)`
- `createDiagnosis(input)`
- `startTreatment(input)`
- `completeVisitProcedure(input)`
- `changeTreatmentStatus(input)`
- `saveClinicalAttachments(input)`

The backend use cases should reuse the same business rules currently present in frontend application use cases:

- Group only acts marked `groupableTeeth`.
- Starting a treatment creates one `VisitProcedure`.
- Starting a treatment can create a `TreatmentCharge`.
- Completing a procedure updates the linked plan progress.
- Cancel/void/decline require status reason where applicable.
- Visits must be scoped by clinic id.

## 7. Database Tables

Create a migration `20260703000001-CreateTreatmentTables.ts`. Use MySQL/InnoDB, `utf8mb4`, explicit indexes, and `VARCHAR(36)` ids to match existing services.

Tables:

### `treatment_acts`

Catalog table for acts available to clinics.

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NULL for global acts, or NOT NULL if clinic-owned
- `name` VARCHAR(255) NOT NULL
- `category` ENUM(...)
- `price` DECIMAL(10,2) NOT NULL
- `groupable_teeth` TINYINT(1) NOT NULL DEFAULT 0
- `visual_type` ENUM('FILLING','ROOT_CANAL','CROWN','EXTRACTION','IMPLANT','GRAFT') NULL
- `affects_tooth` TINYINT(1) NOT NULL DEFAULT 1
- `default_surfaces` JSON NULL
- `active` TINYINT(1) NOT NULL DEFAULT 1
- `created_at`, `updated_at`

Indexes:

- `idx_treatment_acts_clinic_category (clinic_id, category)`
- `idx_treatment_acts_active (active)`

### `visits`

Columns:

- `id` VARCHAR(36) PK DEFAULT UUID()
- `clinic_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `queue_entry_id` VARCHAR(36) NULL
- `appointment_id` VARCHAR(36) NULL
- `chair_id` VARCHAR(36) NOT NULL
- `provider_id` VARCHAR(36) NOT NULL
- `status` ENUM('OPEN','NEEDS_CODING','CLOSED','CANCELLED') NOT NULL DEFAULT 'OPEN'
- `source` ENUM('QUEUE','DIRECT') NOT NULL
- `started_at` DATETIME NOT NULL
- `closed_at` DATETIME NULL
- `cancelled_at` DATETIME NULL
- `cancellation_reason` TEXT NULL
- `created_at`, `updated_at`

Indexes/constraints:

- `idx_visits_clinic_patient_status (clinic_id, patient_id, status)`
- `idx_visits_clinic_queue (clinic_id, queue_entry_id)`
- `idx_visits_clinic_started_at (clinic_id, started_at)`
- Unique active queue visit: `uq_visits_queue_entry (queue_entry_id)` if MySQL nullable uniqueness is acceptable for direct visits.

### `treatment_groups`

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `act_id` VARCHAR(36) NOT NULL
- `act_name` VARCHAR(255) NOT NULL
- `tooth_ids` JSON NOT NULL
- `billing_mode` ENUM('PACKAGE','PER_ITEM') NOT NULL
- `created_at` DATETIME NOT NULL
- `created_by` VARCHAR(36) NOT NULL

Indexes:

- `idx_treatment_groups_patient (clinic_id, patient_id)`

### `treatment_plan_items`

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `act_id` VARCHAR(36) NOT NULL
- `act_name` VARCHAR(255) NOT NULL
- `price` DECIMAL(10,2) NOT NULL
- `priority` ENUM('LOW','NORMAL','HIGH') NOT NULL
- `status` ENUM('PROPOSED','ACCEPTED','SCHEDULED','IN_PROGRESS','COMPLETED','DECLINED','CANCELLED','VOIDED') NOT NULL
- `location` JSON NOT NULL
- `notes` TEXT NULL
- `treatment_group_id` VARCHAR(36) NULL
- `visit_procedure_ids` JSON NOT NULL
- `charge_id` VARCHAR(36) NULL
- `billing_status` ENUM('NOT_CHARGED','CHARGED') NOT NULL DEFAULT 'NOT_CHARGED'
- `created_at` DATETIME NOT NULL
- `created_by` VARCHAR(36) NOT NULL
- `started_at` DATETIME NULL
- `completed_at` DATETIME NULL
- `cancelled_at` DATETIME NULL
- `cancellation_reason` TEXT NULL
- `voided_at` DATETIME NULL
- `void_reason` TEXT NULL
- `status_changed_at` DATETIME NULL
- `status_changed_by` VARCHAR(36) NULL
- `created_at`, `updated_at`

Indexes:

- `idx_treatment_plan_patient_status (clinic_id, patient_id, status)`
- `idx_treatment_plan_group (treatment_group_id)`
- `idx_treatment_plan_charge (charge_id)`

### `visit_procedures`

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `visit_id` VARCHAR(36) NOT NULL
- `treatment_plan_item_id` VARCHAR(36) NOT NULL
- `act_id` VARCHAR(36) NOT NULL
- `act_name` VARCHAR(255) NOT NULL
- `location` JSON NOT NULL
- `status` ENUM('IN_PROGRESS','COMPLETED') NOT NULL
- `action` ENUM('STARTED','CONTINUED','COMPLETED') NOT NULL
- `notes` TEXT NULL
- `performed_at` DATETIME NOT NULL
- `completed_at` DATETIME NULL
- `provider_id` VARCHAR(36) NOT NULL
- `created_at`, `updated_at`

Indexes:

- `idx_visit_procedures_visit (visit_id)`
- `idx_visit_procedures_plan_item (treatment_plan_item_id)`
- `idx_visit_procedures_patient (clinic_id, patient_id)`

### `diagnoses`

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `diagnosis` VARCHAR(255) NOT NULL
- `location` JSON NOT NULL
- `severity` ENUM('MILD','MODERATE','SEVERE') NOT NULL
- `certainty` ENUM('SUSPECTED','CONFIRMED','RULED_OUT') NOT NULL
- `status` ENUM('ACTIVE','RESOLVED','MONITORING') NOT NULL
- `evidence` JSON NOT NULL
- `attachment_ids` JSON NOT NULL
- `symptoms` JSON NOT NULL
- `pain_level` INT NOT NULL DEFAULT 0
- `notes` TEXT NULL
- `created_at` DATETIME NOT NULL
- `created_by` VARCHAR(36) NOT NULL

Indexes:

- `idx_diagnoses_patient_status (clinic_id, patient_id, status)`
- `idx_diagnoses_created_at (clinic_id, created_at)`

### `clinical_attachments`

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `visit_id` VARCHAR(36) NULL
- `type` ENUM('RADIOLOGY','PHOTO','DOCUMENT') NOT NULL
- `title` VARCHAR(255) NOT NULL
- `file_name` VARCHAR(255) NOT NULL
- `mime_type` VARCHAR(100) NOT NULL
- `file_url` TEXT NOT NULL
- `uploaded_at` DATETIME NOT NULL
- `uploaded_by` VARCHAR(36) NOT NULL

Indexes:

- `idx_attachments_patient (clinic_id, patient_id)`
- `idx_attachments_visit (visit_id)`

### `visit_handoffs`

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NOT NULL
- `visit_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `treatment_plan_item_id` VARCHAR(36) NULL
- `text` TEXT NOT NULL
- `status` ENUM('STRUCTURED','DRAFT_NOTE','NEEDS_CODING','CODED') NOT NULL
- `authored_by` VARCHAR(36) NOT NULL
- `saved_at` DATETIME NOT NULL
- `coded_at` DATETIME NULL
- `coded_by` VARCHAR(36) NULL

Indexes:

- `idx_handoffs_visit (visit_id)`
- `idx_handoffs_patient (clinic_id, patient_id)`

### `treatment_charges`

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `visit_id` VARCHAR(36) NOT NULL
- `source_type` ENUM('TREATMENT_PLAN_ITEM','VISIT_PROCEDURE','OTHER') NOT NULL
- `source_id` VARCHAR(36) NOT NULL
- `description` VARCHAR(255) NOT NULL
- `original_amount` DECIMAL(10,2) NOT NULL
- `remaining_amount` DECIMAL(10,2) NOT NULL
- `status` ENUM('OPEN','PARTIALLY_PAID','PAID','VOIDED') NOT NULL
- `created_at` DATETIME NOT NULL
- `created_by` VARCHAR(36) NOT NULL

Indexes:

- `idx_treatment_charges_patient (clinic_id, patient_id, status)`
- `idx_treatment_charges_visit (visit_id)`
- `idx_treatment_charges_source (source_type, source_id)`

### `follow_up_requests`

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `visit_id` VARCHAR(36) NOT NULL
- `treatment_plan_item_id` VARCHAR(36) NULL
- `reason` TEXT NULL
- `preferred_date` DATE NULL
- `urgency` ENUM('ROUTINE','SOON','URGENT') NOT NULL
- `status` ENUM('REQUESTED','SCHEDULED','CANCELLED') NOT NULL DEFAULT 'REQUESTED'
- `requested_at` DATETIME NOT NULL
- `requested_by` VARCHAR(36) NOT NULL

### `medical_document_requests`

Columns:

- `id` VARCHAR(36) PK
- `clinic_id` VARCHAR(36) NOT NULL
- `patient_id` VARCHAR(36) NOT NULL
- `visit_id` VARCHAR(36) NOT NULL
- `treatment_plan_item_id` VARCHAR(36) NULL
- `type` ENUM('PRESCRIPTION','MEDICAL_CERTIFICATE','CLINICAL_REPORT') NOT NULL
- `reason` TEXT NULL
- `status` ENUM('REQUESTED','PREPARED','CANCELLED') NOT NULL DEFAULT 'REQUESTED'
- `requested_at` DATETIME NOT NULL
- `requested_by` VARCHAR(36) NOT NULL

### `outbox`

Use the same table shape as appointment service:

- `id`
- `event_type`
- `payload`
- `published`
- `created_at`

## 8. gRPC Contract

Add `services/lib/proto/treatment.proto` and generated `treatment.ts`.

Update:

- `services/lib/proto/index.ts`
- `services/package.json` `generate:proto`
- proto copy scripts
- `services/nest-cli.json` project assets
- api-gateway proto client registration if the gateway exposes HTTP routes for treatment

Minimum service RPCs:

```proto
syntax = "proto3";
package treatment;

service TreatmentService {
  rpc CreateVisitFromQueue (CreateVisitFromQueueRequest) returns (VisitReply);
  rpc GetTreatmentWorkspace (GetTreatmentWorkspaceRequest) returns (TreatmentWorkspaceReply);
  rpc CreateTreatmentPlanItems (CreateTreatmentPlanItemsRequest) returns (TreatmentPlanItemsReply);
  rpc CreateDiagnosis (CreateDiagnosisRequest) returns (DiagnosisReply);
  rpc StartTreatment (StartTreatmentRequest) returns (StartTreatmentReply);
  rpc CompleteVisitProcedure (CompleteVisitProcedureRequest) returns (CompleteVisitProcedureReply);
  rpc ChangeTreatmentStatus (ChangeTreatmentStatusRequest) returns (TreatmentPlanItemReply);
  rpc SaveVisitHandoff (SaveVisitHandoffRequest) returns (VisitHandoffReply);
  rpc SaveClinicalAttachments (SaveClinicalAttachmentsRequest) returns (ClinicalAttachmentsReply);
  rpc CloseVisit (CloseVisitRequest) returns (CloseVisitReply);
}
```

Use snake_case field names in proto and map to camelCase in `treatment.grpc-mapper.ts`.

Important request fields:

- `CreateVisitFromQueueRequest`
  - `clinic_id`
  - `patient_id`
  - `queue_entry_id`
  - `appointment_id`
  - `chair_id`
  - `provider_id`
  - `started_at`
- `GetTreatmentWorkspaceRequest`
  - `clinic_id`
  - `patient_id`
  - `active_visit_id`

The frontend API repository should call these RPCs through the API gateway or directly through backend-for-frontend endpoints, depending on how gateway routes are implemented.

## 9. Module Wiring

`src/treatment/treatment.module.ts` should follow `AppointmentModule` style:

```ts
@Module({
  imports: [
    TypeOrmModule.forFeature([
      VisitTypeOrmEntity,
      TreatmentActTypeOrmEntity,
      TreatmentGroupTypeOrmEntity,
      TreatmentPlanItemTypeOrmEntity,
      VisitProcedureTypeOrmEntity,
      DiagnosisTypeOrmEntity,
      ClinicalAttachmentTypeOrmEntity,
      VisitHandoffTypeOrmEntity,
      TreatmentChargeTypeOrmEntity,
      OutboxTypeOrmEntity,
    ]),
    PatientGrpcClientModule,
    ClinicGrpcClientModule,
    AppointmentGrpcClientModule,
  ],
  controllers: [TreatmentGrpcController],
  providers: [
    ManageVisitWorkflowUseCase,
    ManageTreatmentWorkspaceUseCase,
    OutboxRelayService,
    {provide: VISIT_WORKFLOW_REPOSITORY, useClass: VisitWorkflowRepository},
    {provide: TREATMENT_REPOSITORY, useClass: TreatmentRepository},
    {provide: DIAGNOSIS_REPOSITORY, useClass: DiagnosisRepository},
    {provide: CLINICAL_ATTACHMENT_REPOSITORY, useClass: ClinicalAttachmentRepository},
    {provide: TREATMENT_BILLING_REPOSITORY, useClass: TreatmentBillingRepository},
    {provide: OUTBOX_REPOSITORY, useClass: OutboxRepository},
    {provide: PATIENT_SERVICE_CLIENT, useClass: PatientServiceGrpcAdapter},
    {provide: CLINIC_SERVICE_CLIENT, useClass: ClinicServiceGrpcAdapter},
    {provide: APPOINTMENT_SERVICE_CLIENT, useClass: AppointmentServiceGrpcAdapter},
  ],
})
export class TreatmentModule {}
```

Only register clients actually used in the first implementation. Do not create empty adapters that are not injected by a use case.

## 10. Integration With Appointment Queue

Current frontend flow:

1. Waiting room marks a queue entry as `IN_CHAIR`.
2. Frontend calls treatment `CreateVisitFromQueue`.
3. Treatment service returns `VisitReply`.
4. Frontend navigates to treatment page with `visitId`.
5. Treatment page calls `GetTreatmentWorkspace`.

Backend service must support idempotency:

- If a visit already exists for `{clinicId, queueEntryId}`, return it.
- If no queue visit exists but the same patient already has an `OPEN` or `NEEDS_CODING` visit, return it.
- Otherwise create a new `OPEN` visit.

Do not store patient demographics in the visit except patient id. Patient details should be fetched from patient-service when needed by the API gateway/frontend.

## 11. API Gateway Work

The current gateway has domain/infrastructure/presentation folders. Add treatment routes following existing gateway conventions.

Required HTTP endpoints for the frontend repository:

- `POST /api/v1/treatment/visits/from-queue`
- `GET /api/v1/treatment/workspace?clinicId=&patientId=&activeVisitId=`
- `POST /api/v1/treatment/plan-items`
- `POST /api/v1/treatment/diagnoses`
- `POST /api/v1/treatment/start`
- `POST /api/v1/treatment/procedures/:id/complete`
- `PATCH /api/v1/treatment/plan-items/:id/status`
- `POST /api/v1/treatment/handoffs`
- `POST /api/v1/treatment/attachments`
- `POST /api/v1/treatment/visits/:id/close`

The gateway should map HTTP JSON to treatment gRPC requests. Keep auth/clinic scoping consistent with existing gateway patterns.

## 12. Frontend Replacement Plan

After the backend exists:

1. Create `frontend/src/infrastructure/treatment/api/ApiTreatmentRepository.ts`.
2. Implement the existing frontend `TreatmentRepository` and `VisitWorkflowRepository` contracts with HTTP calls to the gateway.
3. Move current `InMemoryTreatmentWorkspaceRepository` behind a dev/test switch.
4. Update `frontend/src/infrastructure/treatment/container.ts` to instantiate the API repository in normal runtime.
5. Keep frontend domain/application/presentation unchanged.

This is why the frontend store already calls use cases instead of mutating local data directly.

## 13. Required Config And Scripts

Update `services/package.json`:

- add treatment proto to `generate:proto`
- add `build:treatment-service`
- add `copy-proto:treatment-service`
- add `prebuild:treatment-service`
- add `prestart:treatment-service`
- add `prestart:dev:treatment-service`
- add `start:treatment-service`
- add `start:dev:treatment-service`
- add `test:treatment-service`
- add migration scripts for treatment service

Update `services/nest-cli.json`:

- add `treatment-service` project entry with proto assets.

Update Docker:

- add `services/treatment-service/Dockerfile`
- add service entry in `docker-compose.dev.yml` and production compose if applicable
- add treatment database to `services/mysql/init/01-create-databases.sql`

## 14. Implementation Order

1. Scaffold service files: `app.module.ts`, `main.ts`, `treatment.module.ts`, health module, configs.
2. Add domain entities/enums/repository interfaces.
3. Add TypeORM entities, mappers, repositories.
4. Add migration.
5. Add use cases:
   - first `ManageVisitWorkflowUseCase`
   - then `ManageTreatmentWorkspaceUseCase`
6. Add `treatment.proto`, generate TS types.
7. Add gRPC controller and mapper.
8. Wire service in package scripts, Nest CLI, Docker, DB init.
9. Add focused use case tests and repository mapper tests.
10. Add gateway routes.
11. Add frontend `ApiTreatmentRepository`.

## 15. Acceptance Criteria

- `pnpm --dir services build:treatment-service` succeeds.
- `pnpm --dir services test:treatment-service` succeeds.
- Migration creates all treatment tables and can revert cleanly.
- `CreateVisitFromQueue` is idempotent.
- `GetTreatmentWorkspace` returns the same shape needed by the frontend treatment workspace.
- Starting treatment creates a visit procedure and updates the treatment plan item.
- Completing a procedure updates both procedure and linked treatment plan progress.
- Closing a visit sets visit status to `CLOSED` and saves requested follow-up/document tasks.
- No React/frontend DTOs are imported into `services/treatment-service`.
- No TypeORM entities are imported into `domain` or `application`.
