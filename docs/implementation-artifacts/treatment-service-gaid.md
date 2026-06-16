# Frontend Clean Architecture: Treatment Service Domain

This document defines the Domain and Application layers for the Treatment Service features. It respects the strict dependency rule: **Domain and Application layers must remain framework-agnostic.**

## 1. Domain Entities

Entities represent the core business models. They use camelCase and native `Date` objects.

### ActCatalog Entity

```typescript
export interface ActCatalog {
  id: string;
  clinicId: string;
  code: string; // Admin-defined e.g., "CONSULT", "EXTRACT-1"
  nameAr: string; // Arabic name for multilingual UI
  nameFr: string; // French name
  nameEn: string; // English name
  defaultPrice: number; // DECIMAL(10,2)
  isActive: boolean; // FALSE = hidden from assistant UI (soft-delete)
  createdAt: Date;
  updatedAt: Date;
}
```

### Visit Entity

```typescript
export type VisitStatus = "OPEN" | "CONFIRMED" | "CLOSED";

export interface Visit {
  id: string;
  clinicId: string;
  appointmentId: string; // FK to appointment_service.appointments
  patientId: string; // FK to patient_service.patients
  patientName: string; // Snapshot — write once at visit open, never update
  doctorId: string; // FK to auth_service.users (role=DOCTOR)
  doctorName: string; // Snapshot — write once at visit open, never update
  assistantId?: string; // FK to auth_service.users (role=DENTAL_ASSISTANT)
  assistantName?: string; // Snapshot — set once when assistant assigned, never update
  status: VisitStatus;
  totalAmount: number; // Recalculated on every act change
  confirmedAt?: Date;
  confirmedBy?: string; // FK to auth_service.users — may differ from doctorId
  createdAt: Date;
  updatedAt: Date;
  treatmentActs?: TreatmentAct[]; // Optional: included when fetching full visit details
}
```

### TreatmentAct Entity

```typescript
export type ToothSurface = "MESIAL" | "DISTAL" | "OCCLUSAL" | "BUCCAL" | "LINGUAL" | "PALATAL" | "INCISAL";
export type ToothPart = "CROWN" | "ROOT" | "WHOLE_TOOTH";
export type Dentition = "PERMANENT" | "PRIMARY";
export type TreatmentActStatus = "PLANNED" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface TreatmentAct {
  id: string;
  clinicId: string;
  visitId: string;
  actCatalogId: string;
  toothFdi?: string; // FDI notation e.g., "11" = upper-right central incisor. NULL = not tooth-specific
  quantity: number; // Default 1
  unitPrice: number; // Snapshot of price at entry time — catalog changes do not affect this
  surface?: ToothSurface; // Tooth surface where procedure was performed
  toothPart?: ToothPart; // Part of tooth treated
  dentition: Dentition; // Permanent or primary tooth (default: PERMANENT)
  status: TreatmentActStatus; // Default: DONE
  notes?: string;
  enteredBy: string; // FK to auth_service.users — the assistant or doctor who entered this act
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. Application Layer: Commands & Queries

These interfaces define the inputs for Use Cases.

### Visit Commands

- **OpenVisitCommand**: Triggered when a patient moves to IN_CHAIR in the queue.
  ```typescript
  interface OpenVisitCommand {
    appointmentId: string;
    clinicId: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
  }
  ```

- **AssignAssistantCommand**: Assigns a dental assistant to an open visit.
  ```typescript
  interface AssignAssistantCommand {
    visitId: string;
    assistantId: string;
    assistantName: string;
  }
  ```

- **ConfirmVisitCommand**: Doctor confirms all treatment acts and signs off.
  ```typescript
  interface ConfirmVisitCommand {
    visitId: string;
    confirmedBy: string;
  }
  ```

- **CloseVisitCommand**: Admin/system closes the visit (triggers invoice creation).
  ```typescript
  interface CloseVisitCommand {
    visitId: string;
  }
  ```

### TreatmentAct Commands

- **AddTreatmentActCommand**: Assistant records a new procedure during the visit.
  ```typescript
  interface AddTreatmentActCommand {
    visitId: string;
    actCatalogId: string;
    toothFdi?: string;
    quantity?: number;
    surface?: ToothSurface;
    toothPart?: ToothPart;
    dentition?: Dentition;
    status?: TreatmentActStatus;
    notes?: string;
    enteredBy: string;
    clinicId: string;
  }
  ```

- **UpdateTreatmentActCommand**: Modify an existing act (while visit is OPEN).
  ```typescript
  interface UpdateTreatmentActCommand {
    treatmentActId: string;
    toothFdi?: string;
    quantity?: number;
    surface?: ToothSurface;
    toothPart?: ToothPart;
    dentition?: Dentition;
    status?: TreatmentActStatus;
    notes?: string;
  }
  ```

- **RemoveTreatmentActCommand**: Delete a treatment act from the visit.
  ```typescript
  interface RemoveTreatmentActCommand {
    treatmentActId: string;
    visitId: string;
  }
  ```

### Queries

- **GetActCatalogQuery**: Fetch all active procedures for the clinic.
  ```typescript
  interface GetActCatalogQuery {
    clinicId: string;
    locale: "ar" | "fr" | "en"; // For multilingual names
    page?: number;
    limit?: number;
  }
  ```

- **GetVisitQuery**: Fetch a specific visit with all its treatment acts.
  ```typescript
  interface GetVisitQuery {
    visitId: string;
    clinicId: string;
  }
  ```

- **GetOpenVisitsQuery**: List all OPEN visits for a clinic (for assistant workload).
  ```typescript
  interface GetOpenVisitsQuery {
    clinicId: string;
    doctorId?: string; // Filter by doctor
    page?: number;
    limit?: number;
  }
  ```

---

## 3. Repository Interfaces

Repositories define the data access contract. Implementations live in the Infrastructure layer.

### ActCatalogRepository

```typescript
export interface ActCatalogRepository {
  getById(id: string): Promise<ActCatalog>;
  getByClinic(clinicId: string, locale: string): Promise<ActCatalog[]>;
  getPaginated(query: GetActCatalogQuery): Promise<PaginatedActCatalog>;
  save(catalog: Partial<ActCatalog>): Promise<ActCatalog>;
  update(id: string, updates: Partial<ActCatalog>): Promise<ActCatalog>;
  delete(id: string): Promise<void>; // Soft delete: sets isActive = false
}
```

### VisitRepository

```typescript
export interface PaginatedVisits {
  items: Visit[];
  total: number;
}

export interface VisitRepository {
  getById(id: string): Promise<Visit>;
  getByAppointmentId(appointmentId: string): Promise<Visit | null>;
  getOpenVisits(clinicId: string, doctorId?: string): Promise<PaginatedVisits>;
  save(visit: Partial<Visit>): Promise<Visit>;
  updateStatus(visitId: string, status: VisitStatus): Promise<Visit>;
  updateTotalAmount(visitId: string, newTotal: number): Promise<void>;
  confirm(visitId: string, confirmedBy: string): Promise<Visit>;
  close(visitId: string): Promise<Visit>;
}
```

### TreatmentActRepository

```typescript
export interface TreatmentActRepository {
  getById(id: string): Promise<TreatmentAct>;
  getByVisitId(visitId: string): Promise<TreatmentAct[]>;
  save(act: Partial<TreatmentAct>): Promise<TreatmentAct>;
  update(id: string, updates: Partial<TreatmentAct>): Promise<TreatmentAct>;
  delete(id: string): Promise<void>;
  // Utility: Get all acts for a visit and calculate total
  calculateVisitTotal(visitId: string): Promise<number>;
}
```

---

## 4. Use Cases

### Visit Use Cases

#### **OpenVisitUseCase**
- **Purpose**: Transition a confirmed appointment to an open visit when the patient moves to IN_CHAIR.
- **Input**: `OpenVisitCommand`
- **Output**: `Visit`
- **Logic**:
  1. Validate that the appointment exists and is CONFIRMED.
  2. Check if a visit already exists for this appointment.
  3. Create a new visit with status OPEN.
  4. Emit `visit.opened` event to outbox.
- **Error Handling**: Throw error if appointment not found or already has a visit.

#### **AssignAssistantUseCase**
- **Purpose**: Assign a dental assistant to a visit.
- **Input**: `AssignAssistantCommand`
- **Output**: `Visit`
- **Logic**:
  1. Fetch the visit.
  2. Check that visit status is OPEN.
  3. Update assistantId and assistantName (snapshot).
  4. Emit `visit.assistant.assigned` event.

#### **ConfirmVisitUseCase**
- **Purpose**: Doctor reviews all treatment acts and confirms the visit.
- **Input**: `ConfirmVisitCommand`
- **Output**: `Visit`
- **Logic**:
  1. Fetch the visit.
  2. Validate that visit has at least one DONE treatment act.
  3. Set status to CONFIRMED, confirmedAt, confirmedBy.
  4. Emit `visit.confirmed` event to outbox.
- **Error Handling**: Throw if visit has no acts or visit is already CLOSED.

#### **CloseVisitUseCase**
- **Purpose**: Close the visit and trigger invoice creation in checkout_service.
- **Input**: `CloseVisitCommand`
- **Output**: `Visit`
- **Logic**:
  1. Fetch the visit.
  2. Validate that visit status is CONFIRMED.
  3. Set status to CLOSED.
  4. Emit `visit.closed` event to outbox (checkout_service subscribes and creates invoice).
- **Error Handling**: Throw if visit is not CONFIRMED.

### TreatmentAct Use Cases

#### **AddTreatmentActUseCase**
- **Purpose**: Record a new procedure during the visit.
- **Input**: `AddTreatmentActCommand`
- **Output**: `TreatmentAct`
- **Logic**:
  1. Fetch the visit and verify status is OPEN.
  2. Fetch the act catalog entry to get the current defaultPrice (snapshot).
  3. Create a new treatment act with unitPrice = defaultPrice.
  4. Recalculate visit.totalAmount.
  5. Emit `treatment.act.created` event.
- **Error Handling**: Throw if visit not OPEN or act catalog not found.

#### **UpdateTreatmentActUseCase**
- **Purpose**: Modify an existing act (only allowed while visit is OPEN).
- **Input**: `UpdateTreatmentActCommand`
- **Output**: `TreatmentAct`
- **Logic**:
  1. Fetch the act and its visit.
  2. Verify visit status is OPEN.
  3. Update the act fields.
  4. Recalculate visit.totalAmount.
  5. Emit `treatment.act.updated` event.
- **Business Rule**: unitPrice is immutable (snapshot); only toothFdi, surface, toothPart, dentition, status, and notes can be edited.

#### **RemoveTreatmentActUseCase**
- **Purpose**: Delete a treatment act from the visit.
- **Input**: `RemoveTreatmentActCommand`
- **Output**: `void`
- **Logic**:
  1. Fetch the act and its visit.
  2. Verify visit status is OPEN.
  3. Delete the act.
  4. Recalculate visit.totalAmount.
  5. Emit `treatment.act.removed` event.
- **Error Handling**: Throw if visit is not OPEN or act not found.

### Query Use Cases

#### **GetActCatalogUseCase**
- **Purpose**: Fetch the active procedure list for the assistant UI.
- **Input**: `GetActCatalogQuery`
- **Output**: `ActCatalog[]`
- **Logic**:
  1. Fetch all active acts from repository.
  2. Filter by locale and return appropriate name field (nameAr, nameFr, nameEn).
  3. Cache locally for offline support.

#### **GetOpenVisitsUseCase**
- **Purpose**: List all open visits for workload management.
- **Input**: `GetOpenVisitsQuery`
- **Output**: `PaginatedVisits`
- **Logic**:
  1. Query repository for OPEN visits.
  2. Optionally filter by doctorId.
  3. Return paginated results.

#### **GetVisitDetailUseCase**
- **Purpose**: Fetch a complete visit record with all treatment acts.
- **Input**: `GetVisitQuery`
- **Output**: `Visit` (with `treatmentActs` populated)
- **Logic**:
  1. Fetch the visit.
  2. Fetch all treatment acts for the visit.
  3. Attach acts to the visit object.

---

## 5. Business & Operational Rules

### Visit Lifecycle Rules

1. **State Machine**: Status flow is unidirectional.
   - OPEN → CONFIRMED → CLOSED (normal path)
   - OPEN can stay OPEN indefinitely (e.g., long procedures)
   - Once CLOSED, immutable (no further changes)

2. **Snapshot Integrity**: `patientName` and `doctorName` are written once at visit creation and never changed. This ensures permanent historical records for audit trails.

3. **Total Amount Recalculation**: Whenever a treatment act is added, updated, or removed, the visit's `totalAmount` is recalculated as the sum of all acts: `sum(quantity * unitPrice)`.

4. **Confirmation Workflow**:
   - Before confirming a visit, the doctor must review all acts.
   - At least one act must have `status: DONE`.
   - Doctor can be different from the originally assigned doctorId (covering doctor scenario).

5. **Outbox Pattern**: Every state transition (OPEN, CONFIRMED, CLOSED) and act mutation creates an outbox entry in the same transaction. This guarantees no events are lost.

### TreatmentAct Clinical Rules

1. **Tooth Notation (FDI)**:
   - Upper-right: 11–18 | Upper-left: 21–28
   - Lower-left: 31–38 | Lower-right: 41–48
   - NULL = procedure is not tooth-specific (e.g., consultation fee)

2. **Price Snapshot**: `unitPrice` is copied from `act_catalog.default_price` at entry time and never changes, even if the catalog price is updated later. This preserves accurate historical billing.

3. **Surface & Tooth Part**: These are optional clinical details:
   - `surface`: Specific surface of the tooth (MESIAL, DISTAL, OCCLUSAL, etc.)
   - `toothPart`: Which part of the tooth (CROWN, ROOT, WHOLE_TOOTH)
   - `dentition`: Whether permanent or primary tooth

4. **Status Tracking**: Each act has its own status (`PLANNED`, `IN_PROGRESS`, `DONE`, `CANCELLED`). This allows:
   - Planning future procedures within a visit.
   - Tracking which procedures are in progress.
   - Cancelling procedures without deleting them (audit trail).

5. **Clinic Isolation**: Every fetch and mutation MUST use the `clinicId` extracted from the authenticated user's session.

### Audit & Compliance Rules

- **Immutability After Confirmation**: Once a visit is CONFIRMED, no new acts can be added or existing acts modified. This ensures the doctor's review remains valid.
- **Entry Tracking**: `enteredBy` records which user (assistant or doctor) entered each act for compliance.
- **Audit Events**: All mutations emit events that flow to audit_service for a complete compliance log.

---

## 6. Frontend Folder Mapping

```text
src/
├── domain/
│   └── treatment/
│       ├── entities/
│       │   ├── ActCatalog.ts
│       │   ├── Visit.ts
│       │   └── TreatmentAct.ts
│       └── repositories/
│           ├── ActCatalogRepository.ts
│           ├── VisitRepository.ts
│           └── TreatmentActRepository.ts
├── application/
│   └── treatment/
│       ├── commands/
│       │   ├── OpenVisitCommand.ts
│       │   ├── AssignAssistantCommand.ts
│       │   ├── ConfirmVisitCommand.ts
│       │   ├── CloseVisitCommand.ts
│       │   ├── AddTreatmentActCommand.ts
│       │   ├── UpdateTreatmentActCommand.ts
│       │   └── RemoveTreatmentActCommand.ts
│       ├── queries/
│       │   ├── GetActCatalogQuery.ts
│       │   ├── GetVisitQuery.ts
│       │   └── GetOpenVisitsQuery.ts
│       └── useCases/
│           ├── OpenVisitUseCase.ts
│           ├── AssignAssistantUseCase.ts
│           ├── ConfirmVisitUseCase.ts
│           ├── CloseVisitUseCase.ts
│           ├── AddTreatmentActUseCase.ts
│           ├── UpdateTreatmentActUseCase.ts
│           ├── RemoveTreatmentActUseCase.ts
│           └── GetVisitDetailUseCase.ts
├── infrastructure/
│   ├── api/
│   │   ├── treatment/
│   │   │   ├── visitApi.ts        # API client for visit endpoints
│   │   │   ├── actCatalogApi.ts   # API client for catalog endpoints
│   │   │   └── treatmentActApi.ts # API client for act endpoints
│   │   └── dtos/
│   │       ├── VisitDTO.ts
│   │       ├── ActCatalogDTO.ts
│   │       └── TreatmentActDTO.ts
│   ├── mappers/
│   │   ├── VisitMapper.ts         # Convert DTO (snake_case) <-> Entity (camelCase)
│   │   ├── ActCatalogMapper.ts
│   │   └── TreatmentActMapper.ts
│   └── repositories/
│       ├── VisitRepositoryImpl.ts
│       ├── ActCatalogRepositoryImpl.ts
│       └── TreatmentActRepositoryImpl.ts
└── presentation/
    ├── store/
    │   └── treatment/
    │       ├── visitStore.ts      # Zustand: Manages visits and local cache
    │       ├── treatmentActStore.ts
    │       └── catalogStore.ts
    └── components/
        ├── pages/
        │   ├── TreatmentWorkspace.tsx  # Main treatment area (visit + acts)
        │   └── ActCatalogManagement.tsx # Admin catalog management
        ├── features/
        │   ├── VisitCard.tsx          # Display visit info
        │   ├── TreatmentActList.tsx    # List of procedures
        │   ├── TreatmentActForm.tsx    # Add/edit procedure form
        │   ├── ToothDiagram.tsx        # Visual tooth selector (FDI)
        │   └── VisitControls.tsx       # Assign assistant, confirm, close
        └── hooks/
            ├── useTreatmentActs.ts
            ├── useVisitLifecycle.ts
            └── useActCatalog.ts
```

---

## 7. UI Integration: Treatment Workspace

The Treatment Service integrates into the workflow after a patient is seated in the chair (IN_CHAIR queue status). A **Treatment Workspace** page allows assistants and doctors to manage a visit and its procedures.

### Treatment Workspace Page (`TreatmentWorkspace.tsx`)

**Purpose**: Central interface where assistants record procedures and doctors confirm the visit.

**Layout**:
- **Left Panel**: Visit details (patient name, doctor, appointment type, elapsed time).
- **Center Panel**: Tooth diagram with FDI notation for quick tooth selection.
- **Right Panel**: List of treatment acts recorded so far (with ability to edit/remove while OPEN).
- **Top Bar**: Action buttons (Assign Assistant, Add Procedure, Confirm Visit, Close Visit).

**Workflow**:

1. **Visit Opens**: When the patient is seated (queue status → IN_CHAIR):
   - Call `OpenVisitUseCase` to transition from appointment to visit.
   - Visit appears in the Treatment Workspace with status OPEN.

2. **Assistant Records Acts**:
   - Click "Add Procedure" to open a modal.
   - Select procedure from `ActCatalog` (fetched via `GetActCatalogUseCase`).
   - Optionally select tooth (FDI), surface, toothPart, dentition.
   - Set initial status (e.g., PLANNED or IN_PROGRESS).
   - Submit: Calls `AddTreatmentActUseCase`.
   - Acts list updates in real-time.
   - Visit totalAmount recalculates automatically.

3. **Assign Assistant**:
   - Click "Assign Assistant" to select a staff member.
   - Calls `AssignAssistantUseCase`.
   - Assistant name updates on the visit card.

4. **Edit or Remove Acts**:
   - While visit is OPEN, click "Edit" on any act to modify details.
   - Click "Remove" to delete an act (calls `RemoveTreatmentActUseCase`).
   - Total recalculates immediately.

5. **Doctor Confirms**:
   - Doctor reviews all acts and clicks "Confirm Visit".
   - Calls `ConfirmVisitUseCase`.
   - Visit status → CONFIRMED; acts become immutable.
   - "Add Procedure" and "Remove" buttons disabled.

6. **Close Visit**:
   - Admin or doctor clicks "Close Visit".
   - Calls `CloseVisitUseCase`.
   - Visit status → CLOSED.
   - Emits `visit.closed` event → checkout_service creates invoice.
   - Workspace can optionally redirect to a summary or checkout page.

### Tooth Diagram Component (`ToothDiagram.tsx`)

**Purpose**: Visual tool for quick tooth selection using FDI notation.

**Features**:
- Display all 32 adult teeth (16 if primary selected via dentition toggle).
- Highlight selected tooth with FDI code.
- Color-code teeth by surface (MESIAL, DISTAL, OCCLUSAL, etc.) for multi-surface procedures.
- Click to select/deselect; stores `toothFdi` and optionally `surface`.

### TreatmentActForm Modal (`TreatmentActForm.tsx`)

**Purpose**: Add or edit a treatment act.

**Fields**:
- **Procedure**: Dropdown (fetched from ActCatalog).
- **Tooth**: Optional, via FDI or visual diagram.
- **Surface**: Optional dropdown (MESIAL, DISTAL, OCCLUSAL, BUCCAL, LINGUAL, PALATAL, INCISAL).
- **Tooth Part**: Optional dropdown (CROWN, ROOT, WHOLE_TOOTH).
- **Dentition**: Toggle (PERMANENT / PRIMARY).
- **Quantity**: Number field (default 1).
- **Status**: Dropdown (PLANNED, IN_PROGRESS, DONE, CANCELLED).
- **Notes**: Text area for clinical notes.
- **Price Display**: Read-only, shows the snapshot price at entry time.

**Submit**: Triggers `AddTreatmentActUseCase` or `UpdateTreatmentActUseCase`.

### Real-Time Calculation

- **Zustand Store** (`visitStore.ts`):
  - Watches for act additions/removals.
  - Recalculates `visit.totalAmount = sum(acts.map(a => a.quantity * a.unitPrice))`.
  - Triggers UI re-render via Zustand subscriptions.

### Integration with Queue Service

- **Check-In → Open Visit**: When queue status becomes IN_CHAIR, emit an event that triggers `OpenVisitUseCase` automatically.
- **Back to Queue**: If assistant marks the queue entry as DONE, optionally auto-transition visit to CLOSED (depending on clinic workflow).

---

## 8. Error Handling & User Feedback

### Common Errors

| Scenario | Error | Action |
|----------|-------|--------|
| Try to add act while visit CONFIRMED | `VisitNotOpenError` | Show toast: "Cannot add procedures to a confirmed visit." |
| Try to confirm visit with no acts | `NoTreatmentActsError` | Show validation message: "Add at least one procedure before confirming." |
| Remove act fails (DB error) | `RemoveActFailedError` | Show toast: "Failed to remove procedure. Try again." |
| Act catalog empty | `ActCatalogEmptyError` | Show message: "No procedures available. Please set up the catalog." |
| Unauthorized (not assistant/doctor) | `UnauthorizedError` | Redirect to login or home. |

### Optimistic Updates

- **Add/Update/Remove Acts**: Optimistically update the Zustand store immediately, then sync with API. If sync fails, revert and show error.
- **Confirm Visit**: Disable buttons during the request to prevent double-submission.

---

## 9. Caching & Offline Strategy

### Zustand Store Layers

1. **ActCatalog Cache**: Once fetched, cache for the session. Rarely changes during a single clinic session.
2. **Visit Cache**: Cache open visits per doctor. Invalidate on status change.
3. **TreatmentAct Cache**: Cache acts per visit. Invalidate on mutation.

### Sync Strategy

- On app init or page focus, check for offline changes and sync pending mutations.
- Indicate to user if syncing or if offline.

---

## 10. Integration Points with Other Services

### Outgoing Events (via Outbox)

- `visit.opened`: Triggers queue cleanup or notification.
- `visit.confirmed`: Audit log entry.
- `visit.closed`: Triggers `checkout_service` to create invoice.
- `treatment.act.*`: Audit log entries.

### Incoming Events (via NATS Subscription)

- `appointment.confirmed`: Enables visit to be opened.
- `queue.status.in_chair`: Auto-trigger `OpenVisitUseCase`.
- `queue.status.done`: Optionally auto-close visit.

---

This GAID document provides a complete blueprint for the Treatment Service frontend implementation. The **Clinical Detail Tracking** (surface, toothPart, dentition, status) enables rich clinical workflows, while the **Snapshot Pattern** ensures accurate historical records for billing and compliance.

```
[PROMPT_SUGGESTION] How should I implement the ToothDiagram component to handle FDI notation selection? [/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION] Can you help me design the TreatmentActForm with dynamic field visibility based on procedure type? [/PROMPT_SUGGESTION]
```
