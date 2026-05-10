# Frontend Clean Architecture: Appointment & Queue Domain

This document defines the Domain and Application layers for the Appointment and Queue features. It respects the strict dependency rule: **Domain and Application layers must remain framework-agnostic.**

## 1. Domain Entities

Entities represent the core business models. They use camelCase and native `Date` objects.

### Appointment Entity

```typescript
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "NO_SHOW"
  | "COMPLETED";
export type BookingChannel = "ONLINE" | "WALK_IN" | "PHONE";

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string; // Snapshot from patient_service
  patientPhone?: string; // Snapshot
  doctorId: string;
  doctorName: string; // Snapshot from clinic_service
  startAt: Date;
  endAt: Date; // Flexible duration
  isEmergency: boolean; // Enables calendar overlap override
  type?: string; // e.g., "Checkup", "Root Canal"
  channel: BookingChannel;
  status: AppointmentStatus;
  notes?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
}
```

### QueueEntry Entity

```typescript
export type QueueStatus = "ARRIVED" | "WAITING" | "IN_CHAIR" | "DONE";
export type QueuePriority = "NORMAL" | "URGENT" | "EMERGENCY";

export interface QueueEntry {
  id: string;
  clinicId: string;
  appointmentId: string;
  patientId: string;
  patientName: string; // Snapshot
  doctorId: string;
  doctorName: string; // Snapshot
  appointmentType?: string;
  status: QueueStatus;
  priority: QueuePriority;
  notes?: string;
  arrivedAt: Date;
  calledAt?: Date;
  seatedAt?: Date;
  completedAt?: Date;
}
```

---

## 2. Application Layer: Commands & Queries

These interfaces define the inputs for Use Cases.

### Appointment Commands

- **CreateAppointmentCommand**: Includes `isEmergency` flag and flexible `endAt`.
- **MoveAppointmentCommand**: Used for Drag & Drop operations (contains `newStartAt`, `newEndAt`).
- **GetAppointmentsQuery**: Supports pagination (`page`, `limit`) and viewport ranges (`startDate`, `endDate`).

### Queue Commands

- **UpdateQueueStatusCommand**: Now includes an optional `correctionReason` to allow secretaries to revert statuses (e.g., from `IN_CHAIR` back to `WAITING`).

---

## 3. Repository Interfaces

Repositories define the data access contract. Implementations live in the Infrastructure layer.

### AppointmentRepository

```typescript
export interface PaginatedAppointments {
  items: Appointment[];
  total: number;
}

export interface AppointmentRepository {
  getById(id: string): Promise<Appointment>;
  // Viewport Pattern: Fetch only visible range for calendar optimization
  getByRange(
    clinicId: string,
    start: Date,
    end: Date,
    doctorId?: string,
  ): Promise<Appointment[]>;
  // List Pattern: Paginated results for tables
  getPaginated(query: GetAppointmentsQuery): Promise<PaginatedAppointments>;
  save(appointment: Partial<Appointment>): Promise<Appointment>;
  updateTiming(command: MoveAppointmentCommand): Promise<void>;
  checkConflicts(doctorId: string, start: Date, end: Date): Promise<boolean>;
}
```

---

## 4. Use Cases

### Appointment Use Cases

- **CreateAppointmentUseCase**: Logic for new bookings. Bypasses conflict check if `isEmergency` is true.
- **MoveAppointmentUseCase**: Handles Drag & Drop logic. Checks for conflicts unless the appointment is an emergency.
- **GetCalendarViewUseCase**: Handles fetching and local caching of appointment ranges.

### Queue Use Cases

- **CheckInPatientUseCase**: Transitions an appointment to a `QueueEntry`.
- **CorrectQueueStatusUseCase**: Allows the secretary to move status backward (reverting mistakes) with a required reason.
- **SeatPatientUseCase**: Transitions status to `IN_CHAIR` and records `seatedAt`.

---

## 5. Business & Operational Rules

### Calendar & Scheduling Rules

1.  **The "Emergency Override"**:
    - **Routine Moves**: Drag & Drop is blocked if the target slot overlaps with another non-cancelled appointment for that doctor.
    - **Emergency Moves**: If `isEmergency` is true, the system allows the overlap (Double Booking). The UI should visually stack these items.
2.  **Flexible Duration**: The secretary can manually adjust `endAt`. The system defaults to `startAt + 30 mins` but does not enforce it.
3.  **Snapshot Integrity**: `patientName` and `doctorName` are written once at creation. They represent a permanent historical record of the booking.

### Waiting Room (Queue) Rules

1.  **State Machine with Corrections**:
    - Status normally flows forward: `ARRIVED` → `WAITING` → `IN_CHAIR` → `DONE`.
    - **The Revert Rule**: Secretaries can move a patient back to a previous state only if they provide a "Correction Reason" (logged for audit).
2.  **Optimized Sorting**:
    - The list is sorted by: `status` (Active patients first), then `priority` (`EMERGENCY` > `URGENT` > `NORMAL`), then `arrivedAt` (FIFO).
3.  **Clinic Isolation**: Every fetch and mutation MUST use the `clinicId` extracted from the authenticated user's session.

---

## 6. Frontend Folder Mapping

```text
src/
├── domain/
│   ├── appointment/
│   │   ├── entities/           # Appointment.ts
│   │   └── repositories/       # AppointmentRepository.ts
│   └── queue/
│       ├── entities/           # QueueEntry.ts
│       └── repositories/       # QueueRepository.ts
├── application/
│   ├── appointment/
│   │   ├── commands/           # MoveAppointmentCommand.ts
│   │   └── useCases/           # MoveAppointmentUseCase.ts
│   └── queue/
│       ├── commands/           # UpdateQueueStatusCommand.ts
│       └── useCases/           # CorrectQueueStatusUseCase.ts
├── infrastructure/
│   ├── api/                    # Axios clients (snake_case handling)
│   ├── mappers/                # DTO (API) <-> Entity (Domain)
│   └── repositories/           # Implementations of Domain Repositories
└── presentation/
    ├── store/                  # Zustand: Orchestrates use cases and local cache
    └── components/             # React: Calendar (Drag/Drop) and Waiting Room UI
```

```

This document provides a clear roadmap for your implementation. The **Viewport Pattern** in the repository will keep the calendar fast even as your clinic grows, and the **Emergency Override** logic ensures the secretary has the power they need for real-world scenarios.

<!--
[PROMPT_SUGGESTION]How should I implement the MoveAppointmentUseCase in TypeScript to handle the conflict-check logic?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Can you help me design the Infrastructure Mapper to convert the appointment DTOs from the backend?[/PROMPT_SUGGESTION]
```
