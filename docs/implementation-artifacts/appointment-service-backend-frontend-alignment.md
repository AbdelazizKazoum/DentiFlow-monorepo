# Appointment Service Backend / Frontend Alignment

Date: 2026-05-11

This document captures what was implemented for the appointment microservice and how the frontend should communicate with it through the API Gateway.

## Summary

The backend now includes a new `appointment-service` microservice. It owns:

- Appointments
- Waiting room queue entries
- Appointment/queue outbox events

The frontend should not call `appointment-service` directly. It should call the API Gateway on `http://localhost:3001/api/v1/...`.

## Docker Services

The dev Docker stack now includes:

- `appointment-service`
  - HTTP health port: `3005`
  - gRPC port: `5004`
  - DB: `appointment_db`
- `nats`
  - Client port: `4222`
  - Monitoring port: `8222`
- `api-gateway`
  - Exposes frontend-facing HTTP routes on port `3001`

The existing MySQL container owns `appointment_db`. If using an existing Docker volume, the DB may need to be created manually:

```sql
CREATE DATABASE IF NOT EXISTS appointment_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON appointment_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

For a fresh volume, `services/mysql/init/01-create-databases.sql` now creates it.

## Frontend Base URL

Use:

```text
NEXT_PUBLIC_API_URL=http://localhost:3001
```

All routes below are under:

```text
/api/v1
```

## Appointment Routes

### List Appointments

```http
GET /api/v1/clinics/:clinicId/appointments
```

Supported query params:

```text
page
limit
start_date
end_date
doctor_id
status
```

Response:

```json
{
  "appointments": [
    {
      "id": "uuid",
      "clinic_id": "uuid",
      "patient_id": "uuid",
      "patient_name": "Patient Name",
      "patient_phone": "0636914455",
      "doctor_id": "uuid",
      "doctor_name": "Doctor Name",
      "start_at": "2026-05-12T10:00:00.000Z",
      "end_at": "2026-05-12T10:30:00.000Z",
      "is_emergency": false,
      "type": "Checkup",
      "channel": "PHONE",
      "status": "CONFIRMED",
      "notes": "Optional note",
      "cancelled_at": null,
      "cancellation_reason": null
    }
  ],
  "total": 1
}
```

### Create Appointment

```http
POST /api/v1/clinics/:clinicId/appointments
```

Request:

```json
{
  "patient_id": "uuid",
  "patient_name": "Patient Name",
  "patient_phone": "0636914455",
  "doctor_id": "uuid",
  "doctor_name": "Doctor Name",
  "start_at": "2026-05-12T10:00:00.000Z",
  "end_at": "2026-05-12T10:30:00.000Z",
  "is_emergency": false,
  "type": "Checkup",
  "channel": "PHONE",
  "status": "CONFIRMED",
  "notes": "Optional note"
}
```

Response: one appointment object using the same snake_case shape shown above.

Important behavior:

- Non-emergency appointment creation rejects overlapping appointments for the same doctor.
- Emergency appointment creation allows overlap.
- `patient_id` is validated through `patient-service`.
- `doctor_id` is validated through `clinic-service` and must be a doctor staff member.

### Update Appointment

```http
PUT /api/v1/clinics/:clinicId/appointments/:appointmentId
```

Request can include any editable appointment fields:

```json
{
  "patient_id": "uuid",
  "patient_name": "Patient Name",
  "patient_phone": "0636914455",
  "doctor_id": "uuid",
  "doctor_name": "Doctor Name",
  "start_at": "2026-05-12T10:00:00.000Z",
  "end_at": "2026-05-12T10:30:00.000Z",
  "is_emergency": false,
  "type": "Checkup",
  "channel": "PHONE",
  "status": "CONFIRMED",
  "notes": "Optional note",
  "cancelled_at": "2026-05-12T08:00:00.000Z",
  "cancellation_reason": "Patient called to cancel"
}
```

Response: one appointment object.

### Get Appointment

```http
GET /api/v1/appointments/:appointmentId
```

Response: one appointment object.

### Move Appointment Timing

```http
PATCH /api/v1/appointments/:appointmentId/timing
```

Request:

```json
{
  "doctor_id": "uuid",
  "doctor_name": "Doctor Name",
  "new_start_at": "2026-05-12T11:00:00.000Z",
  "new_end_at": "2026-05-12T11:30:00.000Z"
}
```

Response: one appointment object.

Important behavior:

- Non-emergency moves reject overlap.
- Emergency appointments can be moved into overlap.

### Check Appointment Conflicts

```http
GET /api/v1/appointments/conflicts
```

Supported query params:

```text
doctor_id
start_at
end_at
clinic_id
exclude_status
exclude_appointment_id
```

Response:

```json
{
  "has_conflict": true
}
```

The frontend repository currently expects `has_conflict`, and the API Gateway returns that exact key.

## Queue Routes

### List Queue Entries

```http
GET /api/v1/clinics/:clinicId/queue
```

Response:

```json
{
  "queue_entries": [
    {
      "id": "uuid",
      "clinic_id": "uuid",
      "appointment_id": "uuid",
      "patient_id": "uuid",
      "patient_name": "Patient Name",
      "patient_phone": "0636914455",
      "doctor_id": "uuid",
      "doctor_name": "Doctor Name",
      "appointment_type": "Checkup",
      "status": "ARRIVED",
      "priority": "NORMAL",
      "queue_notes": "Optional queue note",
      "arrived_at": "2026-05-12T09:55:00.000Z",
      "called_at": null,
      "seated_at": null,
      "completed_at": null
    }
  ]
}
```

### Check In Patient

```http
POST /api/v1/clinics/:clinicId/queue
```

Request:

```json
{
  "appointment_id": "uuid",
  "patient_id": "uuid",
  "patient_name": "Patient Name",
  "patient_phone": "0636914455",
  "doctor_id": "uuid",
  "doctor_name": "Doctor Name",
  "appointment_type": "Checkup",
  "priority": "NORMAL",
  "queue_notes": "Arrived at reception",
  "arrived_at": "2026-05-12T09:55:00.000Z"
}
```

Response: one queue entry object.

Important behavior:

- One appointment can only be checked in once.
- Duplicate check-in returns `409 Conflict`.

### Get Queue Entry

```http
GET /api/v1/queue/:queueEntryId
```

Response: one queue entry object.

### Update Queue Status

```http
PATCH /api/v1/queue/:queueEntryId/status
```

Request:

```json
{
  "status": "WAITING"
}
```

Correction request:

```json
{
  "status": "ARRIVED",
  "correction_reason": "Clicked wrong status by mistake"
}
```

Response: one queue entry object.

Important behavior:

- Normal flow: `ARRIVED -> WAITING -> IN_CHAIR -> DONE`.
- Moving backward requires `correction_reason`.
- Backward move without reason returns `400 Bad Request`.
- Timestamps are set when status reaches:
  - `WAITING`: `called_at`
  - `IN_CHAIR`: `seated_at`
  - `DONE`: `completed_at`

### Update Queue Notes

```http
PATCH /api/v1/queue/:queueEntryId/notes
```

Request:

```json
{
  "queue_notes": "Updated receptionist note"
}
```

Response: one queue entry object.

## Enums

Appointment status:

```text
PENDING
CONFIRMED
CANCELLED
NO_SHOW
COMPLETED
```

Booking channel:

```text
ONLINE
WALK_IN
PHONE
```

Queue status:

```text
ARRIVED
WAITING
IN_CHAIR
DONE
```

Queue priority:

```text
NORMAL
URGENT
EMERGENCY
```

## Auth And Clinic Scope

All appointment and queue routes are protected by JWT auth.

Clinic-scoped routes use:

```text
/clinics/:clinicId/...
```

The API Gateway checks that `:clinicId` matches the authenticated user's `clinic_id`.

For entity-id routes without `:clinicId`, such as:

```text
/appointments/:appointmentId
/queue/:queueEntryId/status
```

the gateway now checks the loaded entity belongs to the authenticated user's clinic before returning or mutating it.

## Tested In Docker

The following were tested successfully through the API Gateway:

- Register/login test admin
- Create doctor staff member
- List patients
- Create appointment
- List appointments
- Get appointment by id
- Move appointment timing
- Check conflicts
- Check in patient to queue
- List queue
- Get queue entry by id
- Update queue status
- Update queue notes
- Duplicate queue check-in returns `409`
- Queue backward correction without reason returns `400`
- Queue backward correction with reason succeeds

Outbox events were also verified in `appointment_db.outbox`, and rows were marked `published = 1` by the NATS relay.

## Frontend Alignment Checklist

- Use the API Gateway only, not direct service ports.
- Keep appointment DTO keys snake_case.
- Keep queue DTO keys snake_case.
- Conflict response key is `has_conflict`.
- Appointment list response key is `appointments`.
- Queue list response key is `queue_entries`.
- Use `type` on the frontend appointment DTO; backend maps it to DB `appointment_type`.
- Use `queue_notes` in queue HTTP DTOs; frontend domain can still map to `notes`.
- For check-in from appointment page, pass appointment snapshot fields:
  - `appointment_id`
  - `patient_id`
  - `patient_name`
  - `patient_phone`
  - `doctor_id`
  - `doctor_name`
  - `appointment_type`

## Known Follow-Up

The outbox currently writes event rows after the domain write rather than inside the exact same DB transaction. The routes work and NATS publishing was verified, but strict outbox atomicity should be improved later by wrapping domain write plus outbox insert in one TypeORM transaction.
