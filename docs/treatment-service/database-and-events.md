# Treatment Service Database and Events

This guide aligns the treatment database, TypeORM entities, migrations, and outbox behavior with the existing backend services.

## 1. Database

Service database:

```sql
CREATE DATABASE IF NOT EXISTS treatment_service;
USE treatment_service;
```

Tables:

```text
act_catalog
visits
treatment_acts
outbox
```

## 2. act_catalog

TypeORM entity:

```text
src/infrastructure/persistence/entities/act-catalog.typeorm-entity.ts
```

Important columns:

```text
id
clinic_id
code
name_ar
name_fr
name_en
default_price
is_active
created_at
updated_at
```

Indexes:

```text
UNIQUE (clinic_id, code)
INDEX  (clinic_id)
```

Rule:

```text
default_price is copied into treatment_acts.unit_price at act creation time.
```

## 3. visits

TypeORM entity:

```text
src/infrastructure/persistence/entities/visit.typeorm-entity.ts
```

Important columns:

```text
id
clinic_id
appointment_id
patient_id
patient_name
doctor_id
doctor_name
assistant_id
assistant_name
status
total_amount
confirmed_at
confirmed_by
voided_at
void_reason
created_at
updated_at
```

Status enum:

```text
OPEN
CONFIRMED
CLOSED
VOIDED
```

Indexes:

```text
INDEX (clinic_id)
INDEX (clinic_id, patient_id)
INDEX (clinic_id, doctor_id)
INDEX (clinic_id, status)
INDEX (appointment_id)
```

Active visit rule:

```text
An appointment may have many VOIDED visits over time, but only one active
non-voided visit should exist.
```

Enforce this in the use case. MySQL partial unique indexes are not available in a simple portable way.

## 4. treatment_acts

TypeORM entity:

```text
src/infrastructure/persistence/entities/treatment-act.typeorm-entity.ts
```

Important columns:

```text
id
clinic_id
visit_id
act_catalog_id
tooth_fdi
quantity
unit_price
surface
tooth_part
dentition
status
notes
entered_by
created_at
updated_at
```

Indexes:

```text
INDEX (visit_id)
INDEX (clinic_id)
```

Foreign keys inside treatment service:

```text
treatment_acts.visit_id       -> visits.id
treatment_acts.act_catalog_id -> act_catalog.id
```

Do not add DB foreign keys to other service databases.

## 5. outbox

Use same shape as appointment service:

```text
src/infrastructure/persistence/entities/outbox.typeorm-entity.ts
src/infrastructure/persistence/repositories/outbox.repository.ts
src/infrastructure/nats/outbox-relay.service.ts
```

Columns:

```text
id
event_type
payload
published
created_at
```

Index:

```text
INDEX (published, created_at)
```

## 6. Events

Recommended event types:

```text
visit.opened
visit.assistant.assigned
visit.confirmed
visit.closed
visit.voided
treatment.act.created
treatment.act.updated
treatment.act.removed
```

`visit.closed` should be consumed by checkout service to create an invoice.

Payload example:

```json
{
  "visit_id": "uuid",
  "clinic_id": "uuid",
  "appointment_id": "uuid",
  "patient_id": "uuid",
  "patient_name": "Snapshot Name",
  "doctor_id": "uuid",
  "doctor_name": "Snapshot Doctor",
  "total_amount": 1200,
  "closed_at": "2026-06-18T12:00:00.000Z"
}
```

## 7. Transaction Rules

Use transactions for:

- open visit + outbox event
- assign assistant + outbox event
- void visit + outbox event
- add act + recalculate total + outbox event
- update act + recalculate total + outbox event
- remove act + recalculate total + outbox event
- confirm visit + outbox event
- close visit + outbox event

Total recalculation:

```sql
SELECT COALESCE(SUM(quantity * unit_price), 0)
FROM treatment_acts
WHERE visit_id = ?
  AND status <> 'CANCELLED';
```

## 8. Migration Files

Create:

```text
src/infrastructure/persistence/migrations/20260618000001-CreateTreatmentTables.ts
src/infrastructure/persistence/migrations/20260618000002-SeedActCatalog.ts
```

Migration order:

1. `act_catalog`
2. `visits`
3. `treatment_acts`
4. `outbox`

## 9. TypeORM Mapper Expectations

Use mappers exactly like patient and appointment services:

```text
src/infrastructure/persistence/mappers/visit.mapper.ts
```

Responsibilities:

- convert snake_case entity fields to camelCase domain constructor arguments
- handle nullable date fields
- keep TypeORM entity shape outside domain/application code

Example methods:

```typescript
static toDomain(entity: VisitTypeOrmEntity): Visit
static toPersistence(domain: Visit): Partial<VisitTypeOrmEntity>
```

## 10. Seed Data

Initial act catalog should include clinic-scoped defaults:

```text
CONSULT
FILLING
CROWN
IMPLANT
EXTRACTION
ROOT_CANAL
WHITENING
ORTHODONTICS
```

Seed data should be safe to run repeatedly:

```text
unique key: (clinic_id, code)
upsert or ignore duplicates
```
