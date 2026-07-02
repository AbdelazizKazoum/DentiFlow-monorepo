# Frontend Clean Architecture: Treatment Domain

This document defines the frontend Domain and Application layers for the Treatment feature. It is written as a frontend-first implementation guide, while keeping the architecture ready for a future backend treatment-service.

The goal is to move the current treatment page business logic out of the React page and into clean, typed, testable modules. The strict dependency rule applies: **Domain and Application layers must remain framework-agnostic.**

## 1. Domain Entities

Entities represent the core clinical models. They use camelCase and native `Date` objects. API DTOs can later use snake_case and should be converted through mappers in the Infrastructure layer.

### DentalAct Entity

```typescript
export type SurfaceCode = "V" | "P" | "L" | "M" | "D" | "O" | "R";
export type ActVisualType =
  | "filling"
  | "root_canal"
  | "crown"
  | "extraction"
  | "implant"
  | "graft";
export type ActCategory =
  | "GENERAL"
  | "RADIOGRAPHY"
  | "PREVENTIVE"
  | "RESTORATIVE"
  | "ENDODONTICS"
  | "SURGERY"
  | "PROSTHETICS"
  | "AESTHETIC"
  | "ORTHODONTICS";

export interface DentalAct {
  id: string;
  name: string;
  category: ActCategory;
  price: number;
  groupableTeeth: boolean;
  visualType?: ActVisualType;
  affectsTooth: boolean;
  defaultSurfaces?: SurfaceCode[];
}
```

### TreatmentPlanItem Entity

```typescript
export type TreatmentStatus =
  | "PROPOSED"
  | "ACCEPTED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED"
  | "VOIDED";

export type TreatmentPriority = "LOW" | "NORMAL" | "HIGH";
export type DentitionMode = "ADULT" | "CHILD" | "MIXED";

export interface TreatmentLocation {
  tooth?: number;
  toothIds?: number[];
  mouthRegionId?: string;
  label: string;
  surfaces: SurfaceCode[];
  surfacesByTooth?: Record<number, SurfaceCode[]>;
  dentition: DentitionMode;
}

export interface TreatmentPlanItem {
  id: string;
  clinicId: string;
  patientId: string;
  actId: string;
  actName: string; // Snapshot from DentalAct
  price: number; // Snapshot charged when treatment starts
  priority: TreatmentPriority;
  status: TreatmentStatus;
  location: TreatmentLocation;
  notes?: string;
  treatmentGroupId?: string;
  visitProcedureIds: string[];
  chargeId?: string;
  billingStatus: "NOT_CHARGED" | "CHARGED";
  createdAt: Date;
  createdBy: string;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  voidedAt?: Date;
  voidReason?: string;
}
```

### TreatmentGroup Entity

Grouped treatments are used only when the clinical act is groupable, such as whitening, scaling, or fluoride. A composite filling is not grouped even if multiple teeth are selected.

```typescript
export interface TreatmentGroup {
  id: string;
  clinicId: string;
  patientId: string;
  actId: string;
  actName: string;
  toothIds: number[];
  billingMode: "PACKAGE";
  createdAt: Date;
  createdBy: string;
}
```

### Visit Entity

The visit is created by the treatment domain when the waiting room moves the patient to the chair. The waiting room owns queue state, but the clinical visit record belongs to treatment because all session procedures, diagnoses, notes, charges, handoff, and close-visit workflow attach to it.

```typescript
export type VisitStatus = "OPEN" | "NEEDS_CODING" | "CLOSED" | "CANCELLED";
export type VisitSource = "QUEUE" | "DIRECT";

export interface Visit {
  id: string;
  clinicId: string;
  patientId: string;
  queueEntryId?: string;
  appointmentId?: string;
  chairId: string;
  providerId: string;
  status: VisitStatus;
  source: VisitSource;
  startedAt: Date;
  closedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}
```

### VisitProcedure Entity

A treatment plan item survives across visits. A visit procedure records what happened in one clinical visit.

```typescript
export type VisitProcedureStatus = "IN_PROGRESS" | "COMPLETED";
export type VisitProcedureAction = "STARTED" | "CONTINUED" | "COMPLETED";

export interface VisitProcedure {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId: string;
  actId: string;
  actName: string;
  location: TreatmentLocation;
  status: VisitProcedureStatus;
  action: VisitProcedureAction;
  notes?: string;
  performedAt: Date;
  completedAt?: Date;
  providerId: string;
}
```

### Diagnosis Entity

Diagnosis can target one tooth, multiple teeth, or a mouth region. For multi-teeth diagnosis, create one grouped diagnosis record with `toothIds`, not duplicate records unless the dentist intentionally creates separate diagnoses.

```typescript
export type DiagnosisSeverity = "MILD" | "MODERATE" | "SEVERE";
export type DiagnosisCertainty = "SUSPECTED" | "CONFIRMED" | "RULED_OUT";
export type DiagnosisStatus = "ACTIVE" | "RESOLVED" | "MONITORING";
export type DiagnosisEvidence =
  | "VISUAL_EXAM"
  | "X_RAY"
  | "PERCUSSION_TEST"
  | "COLD_TEST"
  | "PERIODONTAL_PROBING";

export interface Diagnosis {
  id: string;
  clinicId: string;
  patientId: string;
  diagnosis: string;
  location: TreatmentLocation;
  severity: DiagnosisSeverity;
  certainty: DiagnosisCertainty;
  status: DiagnosisStatus;
  evidence: DiagnosisEvidence[];
  attachmentIds: string[];
  symptoms: string[];
  painLevel: number;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}
```

### ClinicalAttachment Entity

X-ray/radiology attachments belong to the clinical record and can be linked to diagnoses. The frontend can use object URLs for mock data, but the backend implementation must store real uploaded files and metadata.

```typescript
export type ClinicalAttachmentType = "RADIOLOGY" | "PHOTO" | "DOCUMENT";

export interface ClinicalAttachment {
  id: string;
  clinicId: string;
  patientId: string;
  visitId?: string;
  type: ClinicalAttachmentType;
  title: string;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
}
```

### TreatmentCharge Entity

Payments are not handled by the treatment page. The treatment page only posts the charge when treatment starts.

```typescript
export interface TreatmentCharge {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  sourceType: "TREATMENT_PLAN_ITEM";
  sourceId: string;
  label: string;
  locationLabel: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  createdAt: Date;
  createdBy: string;
}
```

### VisitHandoff Entity

The dentist can write a free-text note when they do not have time to structure the treatments. The assistant can later code the treatments while the visit remains in a needs-coding state.

```typescript
export type VisitCodingStatus =
  | "STRUCTURED"
  | "DRAFT_NOTE"
  | "NEEDS_CODING"
  | "CODED";
export type VisitLifecycleStatus = "OPEN" | "NEEDS_CODING" | "CLOSED";

export interface VisitHandoff {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId?: string;
  text: string;
  status: VisitCodingStatus;
  authoredBy: string;
  savedAt: Date;
  codedAt?: Date;
  codedBy?: string;
}
```

### Coordination Request Entities

These are treatment-page signals only. Appointment scheduling and medical document generation are separate modules.

```typescript
export type DocumentRequestType =
  | "PRESCRIPTION"
  | "MEDICAL_CERTIFICATE"
  | "CLINICAL_REPORT";
export type RequestStatus = "REQUESTED" | "DONE" | "CANCELLED";
export type FollowUpUrgency = "ROUTINE" | "SOON" | "URGENT";

export interface FollowUpRequest {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId?: string;
  reason?: string;
  preferredDate?: Date;
  urgency: FollowUpUrgency;
  status: RequestStatus;
  requestedAt: Date;
  requestedBy: string;
}

export interface MedicalDocumentRequest {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId?: string;
  type: DocumentRequestType;
  reason?: string;
  status: RequestStatus;
  requestedAt: Date;
  requestedBy: string;
}
```

---

## 2. Application Layer: Commands & Queries

These interfaces define use-case input. They should not import React, Zustand, Next.js, Axios, or UI types.

### Treatment Commands

```typescript
export interface AddTreatmentPlanItemCommand {
  clinicId: string;
  patientId: string;
  actId: string;
  selectedTeeth: number[];
  mouthRegionId?: string;
  surfacesByTooth: Record<number, SurfaceCode[]>;
  priority: TreatmentPriority;
  notes?: string;
  dentition: DentitionMode;
  providerId: string;
}

export interface StartTreatmentCommand {
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId: string;
  providerId: string;
}

export interface CompleteVisitProcedureCommand {
  clinicId: string;
  visitProcedureId: string;
  providerId: string;
}

export interface ChangeTreatmentStatusCommand {
  clinicId: string;
  treatmentPlanItemId: string;
  status: "CANCELLED" | "VOIDED" | "DECLINED";
  reason: string;
  providerId: string;
}
```

### Diagnosis Commands

```typescript
export interface AddDiagnosisCommand {
  clinicId: string;
  patientId: string;
  diagnosis: string;
  selectedTeeth: number[];
  mouthRegionId?: string;
  surfacesByTooth: Record<number, SurfaceCode[]>;
  severity: DiagnosisSeverity;
  certainty: DiagnosisCertainty;
  status: DiagnosisStatus;
  evidence: DiagnosisEvidence[];
  attachmentIds: string[];
  symptoms: string[];
  painLevel: number;
  notes?: string;
  dentition: DentitionMode;
  providerId: string;
}
```

### Visit Workflow Commands

```typescript
export interface CreateVisitFromQueueCommand {
  clinicId: string;
  patientId: string;
  queueEntryId: string;
  appointmentId?: string;
  chairId: string;
  providerId: string;
  startedAt?: Date;
}

export interface SaveVisitHandoffCommand {
  clinicId: string;
  patientId: string;
  visitId: string;
  text: string;
  status: VisitCodingStatus;
  providerId: string;
}

export interface CloseVisitCommand {
  clinicId: string;
  patientId: string;
  visitId: string;
  providerId: string;
  followUpRequest?: {
    treatmentPlanItemId?: string;
    reason?: string;
    preferredDate?: Date;
    urgency: FollowUpUrgency;
  };
  documentRequest?: {
    treatmentPlanItemId?: string;
    type: DocumentRequestType;
    reason?: string;
  };
}
```

### Queries

```typescript
export interface GetTreatmentWorkspaceQuery {
  clinicId: string;
  patientId: string;
  activeVisitId?: string;
}

export interface GetTreatmentHistoryQuery {
  clinicId: string;
  patientId: string;
  tooth?: number;
  treatmentPlanItemId?: string;
}
```

---

## 3. Repository Interfaces

Repositories define data access contracts. Implementations live in Infrastructure. During frontend-first development, use an in-memory or Zustand-backed repository. Later, replace it with HTTP repositories without changing use cases.

### TreatmentRepository

```typescript
export interface TreatmentWorkspace {
  activeVisit?: Visit;
  acts: DentalAct[];
  treatmentPlan: TreatmentPlanItem[];
  currentSession: VisitProcedure[];
  diagnoses: Diagnosis[];
  attachments: ClinicalAttachment[];
  charges: TreatmentCharge[];
  handoffs: VisitHandoff[];
  followUpRequests: FollowUpRequest[];
  documentRequests: MedicalDocumentRequest[];
}

export interface TreatmentRepository {
  getWorkspace(query: GetTreatmentWorkspaceQuery): Promise<TreatmentWorkspace>;
  getTreatmentPlanItem(id: string): Promise<TreatmentPlanItem>;
  saveTreatmentPlanItems(
    items: TreatmentPlanItem[],
  ): Promise<TreatmentPlanItem[]>;
  updateTreatmentPlanItem(
    id: string,
    patch: Partial<TreatmentPlanItem>,
  ): Promise<TreatmentPlanItem>;
  saveTreatmentGroup(group: TreatmentGroup): Promise<TreatmentGroup>;
  saveVisitProcedure(procedure: VisitProcedure): Promise<VisitProcedure>;
  updateVisitProcedure(
    id: string,
    patch: Partial<VisitProcedure>,
  ): Promise<VisitProcedure>;
}
```

### DiagnosisRepository

```typescript
export interface DiagnosisRepository {
  save(diagnosis: Diagnosis): Promise<Diagnosis>;
  getByPatient(clinicId: string, patientId: string): Promise<Diagnosis[]>;
  getByTreatmentLocation(
    clinicId: string,
    patientId: string,
    location: TreatmentLocation,
  ): Promise<Diagnosis[]>;
}
```

### ClinicalAttachmentRepository

```typescript
export interface UploadClinicalAttachmentInput {
  clinicId: string;
  patientId: string;
  visitId?: string;
  type: ClinicalAttachmentType;
  file: File;
  uploadedBy: string;
}

export interface ClinicalAttachmentRepository {
  upload(input: UploadClinicalAttachmentInput): Promise<ClinicalAttachment>;
  getByPatient(
    clinicId: string,
    patientId: string,
  ): Promise<ClinicalAttachment[]>;
}
```

### TreatmentBillingRepository

```typescript
export interface TreatmentBillingRepository {
  postTreatmentCharge(charge: TreatmentCharge): Promise<TreatmentCharge>;
  existsForTreatmentPlanItem(
    clinicId: string,
    treatmentPlanItemId: string,
  ): Promise<boolean>;
}
```

### VisitWorkflowRepository

```typescript
export interface VisitWorkflowRepository {
  createVisit(command: CreateVisitFromQueueCommand): Promise<Visit>;
  getActiveVisitByPatient(
    clinicId: string,
    patientId: string,
  ): Promise<Visit | null>;
  getVisitByQueueEntry(
    clinicId: string,
    queueEntryId: string,
  ): Promise<Visit | null>;
  updateVisitStatus(
    visitId: string,
    status: VisitStatus,
    changedBy: string,
  ): Promise<Visit>;
  saveHandoff(handoff: VisitHandoff): Promise<VisitHandoff>;
  markHandoffCoded(handoffId: string, codedBy: string): Promise<VisitHandoff>;
  closeVisit(command: CloseVisitCommand): Promise<void>;
  createFollowUpRequest(request: FollowUpRequest): Promise<FollowUpRequest>;
  createDocumentRequest(
    request: MedicalDocumentRequest,
  ): Promise<MedicalDocumentRequest>;
}
```

---

## 4. Use Cases

### Treatment Planning Use Cases

- **AddTreatmentPlanItemUseCase**: Creates treatment plan rows from the selected act and target. If the act is groupable and multiple teeth are selected, it creates one grouped item. If the act is not groupable, it creates one item per tooth.
- **StartTreatmentUseCase**: Starts or continues a treatment. If an active procedure already exists in the current visit, it returns that procedure instead of creating a duplicate.
- **CompleteVisitProcedureUseCase**: Marks the current visit procedure as completed and updates the linked treatment plan item.
- **ChangeTreatmentStatusUseCase**: Cancels, voids, or declines a plan item while preserving audit fields and reason.
- **GetTreatmentDetailsUseCase**: Loads linked diagnoses, prior procedures, handoff notes, charges, document requests, and follow-up requests for the details modal.

### Diagnosis Use Cases

- **AddDiagnosisUseCase**: Creates one diagnosis for one tooth, one grouped diagnosis for multiple teeth, or one region-level diagnosis for a mouth region.
- **AttachRadiologyToDiagnosisUseCase**: Uploads radiology files and links attachment IDs to the diagnosis evidence.
- **GetSelectedTeethEventsUseCase**: Builds the tooth details panel events from diagnoses, treatment plan items, and current session procedures.

### Visit Workflow Use Cases

- **CreateVisitFromQueueUseCase**: Creates the clinical visit when the waiting room seats the patient or marks them in chair. It is idempotent by `queueEntryId` and patient active-visit state.
- **SaveVisitHandoffUseCase**: Saves free-text handoff as draft or needs-coding.
- **SendVisitToAssistantUseCase**: Marks the visit as `NEEDS_CODING`, saves the note, and redirects the dentist to the waiting room.
- **MarkVisitCodingCompleteUseCase**: Marks assistant-coded handoff as structured.
- **CloseVisitUseCase**: Closes the visit and optionally creates follow-up and medical document requests.

### Billing Use Cases

- **PostTreatmentChargeOnStartUseCase**: Posts a charge once, when the treatment starts. It never posts again on continue.
- **GetPatientTreatmentBalanceUseCase**: Calculates new clinical charges visible to the treatment page. Payment collection remains outside this service.

---

## 5. Business & Operational Rules

### Odontogram Selection Rules

1.  **Tooth Selection**:
    - Clicking a tooth toggles that tooth.
    - Selecting a tooth clears the selected mouth region.
    - Dragging an act onto a tooth selects only that tooth.
2.  **Mouth Region Selection**:
    - Selecting a mouth region clears all selected teeth.
    - Supported regions: whole mouth, upper arch, lower arch, upper right, upper left, lower left, lower right.
3.  **Dentition Modes**:
    - Adult, child, and mixed dentition are supported.
    - Changing dentition clears selected teeth, selected region, active surfaces, and pending drop state.

### Treatment Planning Rules

1.  **Act Targeting**:
    - A treatment can target one tooth, multiple teeth, or a mouth region.
    - Treatment rows must store a human-readable location label for UI and billing snapshots.
2.  **Grouped Acts**:
    - Groupable acts such as whitening, scaling, and fluoride are represented as one treatment row when multiple teeth are selected.
    - Non-groupable acts such as composite fillings create separate treatment rows per tooth.
3.  **Surface Selection**:
    - Surfaces are captured per tooth.
    - Root canal treatments can use `R`.
    - Mouth-region treatments usually use an empty surface list and display as full region/full mouth.
4.  **Visual Styling**:
    - Each act has its own visual rules.
    - Consultation, X-ray, scaling, fluoride, whitening, and orthodontic consultation do not visually alter the tooth.
    - Restorative/endodontic/prosthetic/surgical acts can visually mark surfaces or structural modifiers.

### Visit Session Rules

1.  **Visit Creation From Waiting Room**:
    - When the waiting room moves a patient to `IN_CHAIR`, it calls `CreateVisitFromQueueUseCase`.
    - The queue page triggers the action, but the use case and repository live in the treatment domain.
    - The created visit becomes the active clinical visit for the treatment page.
    - The visit stores `queueEntryId`, optional `appointmentId`, `chairId`, `providerId`, `patientId`, and `startedAt`.
2.  **Idempotency**:
    - If a visit already exists for the same `queueEntryId`, return the existing visit.
    - If the patient already has an active `OPEN` or `NEEDS_CODING` visit, block creation or return the existing active visit depending on the UI flow.
    - This prevents duplicate visits when the waiting room action is clicked twice or the browser refreshes.
3.  **Queue Boundary**:
    - The treatment domain does not own queue sorting or queue state transitions.
    - The waiting room can update queue status to `IN_CHAIR`, then call treatment visit creation.
    - If visit creation fails, the waiting room should show an error and avoid navigating to the treatment page.
4.  **Treatment Page Entry**:
    - The treatment page should load by `patientId` and active `visitId`.
    - If no active visit exists, the page should show a controlled empty/error state instead of creating a visit silently.

5.  **Start vs Continue**:
    - Starting a treatment creates a current-session procedure and sets the plan item to `IN_PROGRESS`.
    - Continuing an already-started treatment creates a new visit procedure only if there is no active procedure for that treatment in the current visit.
    - Clicking Continue repeatedly in the same visit must not create duplicate procedures.
6.  **Grouped Treatment Continuation**:
    - Grouped acts continue as one row and one current-session procedure.
    - The dentist starts and completes the grouped treatment for all grouped teeth together.
7.  **Mark Done Confirmation**:
    - Mark Done must open a confirmation modal.
    - Confirmation marks the visit procedure completed and updates linked treatment progress.
8.  **Completion**:
    - Treatment plan completion is clinical progress only.
    - It does not create a payment transaction.

### Charging Rules

1.  **Charge Timing**:
    - The charge is posted when the dentist starts the treatment, not when it is completed.
    - Continue must never duplicate the charge.
2.  **Payment Separation**:
    - The treatment service only posts clinical charges.
    - Payment collection, partial payments, balance handling, and cashier workflows belong to the payment service/page.
3.  **Price Snapshot**:
    - The plan item stores the act price snapshot.
    - The charge uses that snapshot, so later catalog price changes do not alter historical charges.

### Diagnosis Rules

1.  **Diagnosis Scope**:
    - One selected tooth creates one tooth-level diagnosis.
    - Multiple selected teeth create one grouped diagnosis with `toothIds`.
    - A selected mouth region creates one region-level diagnosis.
2.  **Clinical Detail**:
    - Diagnosis should store severity, certainty, status, evidence, symptoms, pain level, notes, and attachment IDs.
3.  **Radiology**:
    - X-ray is radiology.
    - Uploading an X-ray should add `X_RAY` evidence and link the attachment to the diagnosis.
    - Frontend mock can use object URLs; production must use real storage.

### Doctor Handoff & Visit Closing Rules

1.  **Doctor Handoff**:
    - The dentist can save a draft handoff note.
    - The dentist can send the visit to assistant coding.
    - Sending to assistant marks the visit as needs-coding and redirects the dentist to the waiting room.
2.  **Assistant Coding**:
    - Assistant/secretary can convert the free-text note into structured treatment and diagnosis records.
    - After coding, the visit can return to open/structured state.
3.  **Close Visit**:
    - Closing the visit requires confirmation.
    - Closing redirects to the waiting room.
    - Closing can create follow-up scheduling requests and medical document requests.
4.  **Coordination Requests**:
    - Follow-up scheduling requests are signals for the appointment module.
    - Medical document requests are signals for the document module.
    - The treatment page must not implement full appointment scheduling or document generation.

### Audit & Safety Rules

1.  **No Silent Deletion**:
    - Cancelled, voided, declined, and completed items remain in history.
2.  **Void vs Cancel**:
    - Void means entered in error.
    - Cancel means intentionally cancelled from the plan.
3.  **Clinic Isolation**:
    - Every use case command and repository query must include `clinicId`.
4.  **Historical Snapshots**:
    - Patient, provider, act name, location, and price should be saved as snapshots where they affect historical reporting.

---

## 6. Frontend Folder Mapping

```text
src/
├── domain/
│   └── treatment/
│       ├── entities/
│       │   ├── DentalAct.ts
│       │   ├── TreatmentPlanItem.ts
│       │   ├── TreatmentGroup.ts
│       │   ├── Visit.ts
│       │   ├── VisitProcedure.ts
│       │   ├── Diagnosis.ts
│       │   ├── ClinicalAttachment.ts
│       │   ├── TreatmentCharge.ts
│       │   ├── VisitHandoff.ts
│       │   └── CoordinationRequest.ts
│       └── repositories/
│           ├── TreatmentRepository.ts
│           ├── DiagnosisRepository.ts
│           ├── ClinicalAttachmentRepository.ts
│           ├── TreatmentBillingRepository.ts
│           └── VisitWorkflowRepository.ts
├── application/
│   └── treatment/
│       ├── commands/
│       │   ├── AddTreatmentPlanItemCommand.ts
│       │   ├── StartTreatmentCommand.ts
│       │   ├── AddDiagnosisCommand.ts
│       │   ├── CreateVisitFromQueueCommand.ts
│       │   ├── SaveVisitHandoffCommand.ts
│       │   └── CloseVisitCommand.ts
│       └── useCases/
│           ├── AddTreatmentPlanItemUseCase.ts
│           ├── StartTreatmentUseCase.ts
│           ├── CompleteVisitProcedureUseCase.ts
│           ├── ChangeTreatmentStatusUseCase.ts
│           ├── AddDiagnosisUseCase.ts
│           ├── UploadRadiologyAttachmentUseCase.ts
│           ├── CreateVisitFromQueueUseCase.ts
│           ├── SaveVisitHandoffUseCase.ts
│           ├── SendVisitToAssistantUseCase.ts
│           ├── CloseVisitUseCase.ts
│           └── GetTreatmentDetailsUseCase.ts
├── infrastructure/
│   └── treatment/
│       ├── api/
│       │   └── treatmentApi.ts
│       ├── mappers/
│       │   ├── treatmentPlanMapper.ts
│       │   ├── diagnosisMapper.ts
│       │   └── attachmentMapper.ts
│       └── repositories/
│           ├── HttpTreatmentRepository.ts
│           ├── LocalTreatmentRepository.ts
│           ├── HttpDiagnosisRepository.ts
│           ├── HttpClinicalAttachmentRepository.ts
│           ├── HttpTreatmentBillingRepository.ts
│           └── HttpVisitWorkflowRepository.ts
└── presentation/
    └── admin/
        └── treatment/
            ├── TreatmentPage.tsx
            ├── store/
            │   └── useTreatmentWorkspaceStore.ts
            ├── data/
            │   ├── dentalActs.data.ts
            │   ├── diagnosisCatalog.data.ts
            │   ├── mouthRegions.data.ts
            │   └── toothChart.data.ts
            ├── components/
            │   ├── odontogram/
            │   │   ├── Odontogram.tsx
            │   │   ├── AnatomicalTooth.tsx
            │   │   └── SurfacePickerModal.tsx
            │   ├── sidePanel/
            │   │   ├── TreatmentSidePanel.tsx
            │   │   ├── TreatmentActPicker.tsx
            │   │   ├── DiagnosisForm.tsx
            │   │   └── SelectionSummary.tsx
            │   ├── session/
            │   │   ├── CurrentSessionPanel.tsx
            │   │   ├── VisitHandoffCard.tsx
            │   │   └── CloseVisitModal.tsx
            │   ├── plan/
            │   │   ├── TreatmentPlanTable.tsx
            │   │   ├── TreatmentPlanRow.tsx
            │   │   └── TreatmentDetailsModal.tsx
            │   └── history/
            │       └── ClinicalHistoryTable.tsx
            └── hooks/
                ├── useTreatmentWorkspace.ts
                ├── useOdontogramSelection.ts
                ├── useTreatmentActions.ts
                └── useDiagnosisActions.ts
```

---

## 7. UI Integration: Treatment Page Composition

The treatment page should become an orchestration shell. It should select state from the treatment store, instantiate use cases, and pass view models to presentational components.

### Recommended Component Responsibilities

- **TreatmentPage.tsx**:
  - Reads route params and authenticated clinic/patient context.
  - Loads workspace data through `GetTreatmentWorkspaceUseCase`.
  - Wires use-case actions to child components.
  - Owns high-level tab state only if it is purely UI state.
- **Odontogram.tsx**:
  - Renders adult, child, and mixed dentition.
  - Receives tooth visual state as props.
  - Emits tooth click, surface open, drag over, and drop events.
- **TreatmentSidePanel.tsx**:
  - Owns selection summary, mouth region select, treatment act picker, diagnosis form, and details tab.
  - Does not mutate domain state directly; calls use-case actions.
- **TreatmentPlanTable.tsx**:
  - Lists active plan items.
  - Shows Start/Continue, Details, Cancel, and Void actions.
  - Grouped treatment items render as one row.
- **CurrentSessionPanel.tsx**:
  - Lists active/current visit procedures.
  - Supports Mark Done with confirmation.
  - Contains handoff card and close-visit action.
- **TreatmentDetailsModal.tsx**:
  - Shows diagnoses, visit timeline, handoff notes, posted charge, linked document requests, and follow-up requests.

### Store Responsibilities

The Zustand store should be a presentation adapter, not the domain owner.

```typescript
export interface TreatmentWorkspaceState {
  workspace: TreatmentWorkspace | null;
  selectedTeeth: number[];
  selectedMouthRegionId?: string;
  activeSurfaces: SurfaceCode[];
  selectedActId?: string;
  selectedDentition: DentitionMode;
  activeTab: "SESSION" | "PLAN" | "HISTORY";
  isLoading: boolean;
  error?: string;

  setSelection(selection: {
    selectedTeeth?: number[];
    selectedMouthRegionId?: string;
  }): void;
  setActiveSurfaces(surfaces: SurfaceCode[]): void;
  setSelectedActId(actId?: string): void;
  setWorkspace(workspace: TreatmentWorkspace): void;
}
```

Use cases should return updated entities. The store applies those updates so React can re-render.

---

## 8. UI Integration: Waiting Room Creates Visit

The waiting room page should not create visit state locally. When a patient is seated, it calls the treatment-domain use case that creates or returns the active visit.

### Trigger

- User clicks a waiting-room action such as **Seat Patient**, **Send to Chair**, or **Start Visit**.
- Queue status moves to `IN_CHAIR`.
- The waiting room calls `CreateVisitFromQueueUseCase`.
- On success, navigate to the treatment page with `patientId` and the created `visitId`.

### Action Flow

1. Waiting room validates that the queue entry belongs to the current `clinicId`.
2. Waiting room updates queue state to `IN_CHAIR`.
3. Waiting room executes `CreateVisitFromQueueUseCase` with:
   - `clinicId`
   - `patientId`
   - `queueEntryId`
   - optional `appointmentId`
   - `chairId`
   - `providerId`
4. Use case checks for an existing visit by `queueEntryId`.
5. Use case checks for an active visit for the same patient.
6. Use case creates the `Visit` if none exists.
7. UI navigates to the treatment page.

### Error Handling

- If the patient already has an active visit, show an action to open that visit instead of creating another one.
- If visit creation fails after queue status changes, show an error and allow the user to retry.
- If the visit exists for the same queue entry, return it and navigate normally.

### Domain Alignment

The queue feature owns queue ordering and queue status. The treatment feature owns clinical visits. This keeps the waiting room operational while the treatment service remains the source of truth for clinical session records.

---

## 9. Frontend-First Implementation Plan

### Step 1: Extract Domain Types

Move the local interfaces currently inside `TreatmentPage.tsx` into `src/domain/treatment/entities`. Keep names stable and write tests for simple helpers.

### Step 2: Extract Static Data

Move dental acts, diagnosis catalog, mouth regions, dentition chart arrays, and visual style mapping into `presentation/admin/treatment/data`.

### Step 3: Create Use Cases Around Current Logic

Start with pure TypeScript use cases:

- Add treatment plan item
- Add diagnosis
- Start treatment
- Complete visit procedure
- Change treatment status
- Save handoff
- Close visit

### Step 4: Create Local Repositories

Build local repository implementations that wrap the current Zustand state. This keeps the frontend usable before backend integration.

### Step 5: Split UI Components

Extract components from the current page in this order:

1. Surface picker modal
2. Treatment details modal
3. Close visit modal
4. Current session panel
5. Treatment plan table
6. Side panel
7. Odontogram and tooth component

### Step 6: Add HTTP Repositories Later

When the backend treatment-service is ready, add HTTP repositories and DTO mappers. Do not change the use cases or presentation components unless the business contract changes.

---

## 10. Backend Alignment Notes For Later

The frontend domain should be prepared for these future backend tables/collections:

- `dental_acts`
- `visits`
- `treatment_plan_items`
- `treatment_groups`
- `visit_procedures`
- `diagnoses`
- `clinical_attachments`
- `treatment_charges`
- `visit_handoffs`
- `follow_up_requests`
- `medical_document_requests`

Keep these out of the treatment page for now:

- payment collection and partial payments
- appointment scheduling calendar
- final prescription/certificate generation
- insurance and pre-authorization
- consent workflows

Those belong to separate services/pages and can consume the requests emitted by the treatment workflow.

---

## 11. Acceptance Checklist

- [ ] Waiting room calls `CreateVisitFromQueueUseCase` when a patient is seated/in chair.
- [ ] Creating a visit is idempotent by `queueEntryId`.
- [ ] A patient cannot accidentally get two active visits from repeated waiting-room actions.
- [ ] `TreatmentPage.tsx` imports domain types instead of defining them locally.
- [ ] Dental acts and diagnosis catalog are no longer hardcoded inside the page.
- [ ] Treatment creation rules are covered by use-case tests.
- [ ] Grouped acts create one plan item only for groupable acts.
- [ ] Non-groupable acts create one item per selected tooth.
- [ ] Starting a treatment posts one charge and creates one current-session procedure.
- [ ] Continuing a treatment in the same visit does not duplicate the procedure.
- [ ] Mark Done uses confirmation and updates the linked plan item.
- [ ] Diagnosis supports one tooth, grouped teeth, and mouth regions.
- [ ] X-ray upload links clinical attachments to diagnosis evidence.
- [ ] Send to assistant saves handoff and redirects to waiting room.
- [ ] Close visit creates optional follow-up/document requests and redirects to waiting room.
- [ ] Cancelled and voided treatment items remain visible in history.
- [ ] Full TypeScript and ESLint pass for all extracted treatment modules.

This document is the roadmap for implementing the treatment business cleanly in the frontend first, while keeping the same boundaries needed for a later treatment-service backend.
