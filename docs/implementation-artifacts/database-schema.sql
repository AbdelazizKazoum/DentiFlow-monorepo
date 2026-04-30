-- =============================================================================
-- DentiFlow Database Schema
-- Engine  : MySQL 8.4 LTS
-- Strategy: Per-service schemas, clinic_id isolation, outbox per write-service
-- =============================================================================


-- =============================================================================
-- AUTH SERVICE
-- =============================================================================
CREATE DATABASE IF NOT EXISTS auth_service;
USE auth_service;

CREATE TABLE users (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id     CHAR(36)     NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM(
                  'PATIENT',
                  'SECRETARY',
                  'DENTAL_ASSISTANT',
                  'DOCTOR',
                  'ADMIN'
                )            NOT NULL,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_users_email_clinic (email, clinic_id),
  INDEX   idx_users_clinic          (clinic_id),
  INDEX   idx_users_role            (clinic_id, role)
);

CREATE TABLE refresh_tokens (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)     NOT NULL,
  clinic_id   CHAR(36)     NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  DATETIME     NOT NULL,
  revoked_at  DATETIME         NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_refresh_token_hash  (token_hash),
  INDEX   idx_refresh_tokens_user    (user_id),
  INDEX   idx_refresh_tokens_clinic  (clinic_id),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);


-- =============================================================================
-- CLINIC SERVICE
-- =============================================================================
CREATE DATABASE IF NOT EXISTS clinic_service;
USE clinic_service;

CREATE TABLE clinics (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  slug       VARCHAR(100) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(30)      NULL,
  email      VARCHAR(255)     NULL,
  address    TEXT             NULL,
  timezone   VARCHAR(60)  NOT NULL DEFAULT 'Africa/Algiers',
  locale     ENUM('ar','fr','en') NOT NULL DEFAULT 'fr',
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_clinics_slug (slug)
);

-- One row per day-of-week per clinic (0=Sunday … 6=Saturday)
CREATE TABLE working_hours (
  id           CHAR(36) NOT NULL DEFAULT (UUID()),
  clinic_id    CHAR(36) NOT NULL,
  day_of_week  TINYINT  NOT NULL COMMENT '0=Sun 1=Mon … 6=Sat',
  open_time    TIME         NULL COMMENT 'NULL means closed this day',
  close_time   TIME         NULL,
  is_closed    BOOLEAN  NOT NULL DEFAULT FALSE,

  PRIMARY KEY (id),
  UNIQUE KEY uq_working_hours_day (clinic_id, day_of_week),
  INDEX  idx_working_hours_clinic  (clinic_id),
  CONSTRAINT fk_working_hours_clinic FOREIGN KEY (clinic_id) REFERENCES clinics (id) ON DELETE CASCADE
);

-- Links a platform user to a clinic with a specific role and professional profile
CREATE TABLE staff_members (
  id         CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id  CHAR(36)     NOT NULL,
  user_id    CHAR(36)     NOT NULL COMMENT 'FK to auth_service.users',
  role       ENUM('SECRETARY','DENTAL_ASSISTANT','DOCTOR','ADMIN') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  phone      VARCHAR(30)      NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_staff_user_clinic  (user_id, clinic_id),
  INDEX  idx_staff_clinic          (clinic_id),
  INDEX  idx_staff_role            (clinic_id, role),
  INDEX  idx_staff_name            (clinic_id, last_name, first_name)
);


-- =============================================================================
-- PATIENT SERVICE
-- =============================================================================
CREATE DATABASE IF NOT EXISTS patient_service;
USE patient_service;

CREATE TABLE patients (
  id            CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id     CHAR(36)     NOT NULL,
  user_id       CHAR(36)         NULL COMMENT 'FK to auth_service.users — NULL for walk-in patients',
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(30)      NULL,
  email         VARCHAR(255)     NULL,
  date_of_birth DATE             NULL,
  gender        ENUM('MALE','FEMALE','OTHER') NULL,
  address       TEXT             NULL,
  notes         TEXT             NULL COMMENT 'Internal clinic notes',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_patients_clinic  (clinic_id),
  INDEX idx_patients_user    (user_id),
  INDEX idx_patients_phone   (clinic_id, phone),
  INDEX idx_patients_name    (clinic_id, last_name, first_name)
);


-- =============================================================================
-- APPOINTMENT SERVICE
-- =============================================================================
CREATE DATABASE IF NOT EXISTS appointment_service;
USE appointment_service;

CREATE TABLE appointments (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id        CHAR(36)     NOT NULL,
  patient_id       CHAR(36)     NOT NULL COMMENT 'FK to patient_service.patients',
  patient_name     VARCHAR(255) NOT NULL COMMENT 'Snapshot: first + last name at booking time',
  patient_phone    VARCHAR(30)      NULL COMMENT 'Snapshot: contact phone at booking time',
  doctor_id        CHAR(36)     NOT NULL COMMENT 'FK to auth_service.users (role=DOCTOR)',
  doctor_name      VARCHAR(255) NOT NULL COMMENT 'Snapshot: doctor display name at booking time',
  scheduled_at     DATETIME     NOT NULL,
  duration_minutes SMALLINT  NOT NULL DEFAULT 30,
  channel          ENUM('ONLINE','WALK_IN','PHONE') NOT NULL,
  status           ENUM(
                     'PENDING',
                     'CONFIRMED',
                     'CANCELLED',
                     'NO_SHOW',
                     'COMPLETED'
                   )          NOT NULL DEFAULT 'PENDING',
  notes            TEXT           NULL,
  created_by       CHAR(36)       NULL COMMENT 'FK to auth_service.users — NULL for self-booked patients',
  created_at       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_appointments_clinic      (clinic_id),
  INDEX idx_appointments_patient     (clinic_id, patient_id),
  INDEX idx_appointments_doctor_date (clinic_id, doctor_id, scheduled_at),
  INDEX idx_appointments_status_date (clinic_id, status, scheduled_at)
);

-- Outbox for reliable NATS event publication
CREATE TABLE outbox (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  event_type  VARCHAR(100) NOT NULL,
  payload     JSON         NOT NULL,
  published   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_outbox_unpublished (published, created_at)
);


-- =============================================================================
-- QUEUE SERVICE
-- =============================================================================
CREATE DATABASE IF NOT EXISTS queue_service;
USE queue_service;

CREATE TABLE queue_entries (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id        CHAR(36)     NOT NULL,
  appointment_id   CHAR(36)     NOT NULL COMMENT 'FK to appointment_service.appointments',
  patient_id       CHAR(36)     NOT NULL COMMENT 'FK to patient_service.patients',
  patient_name     VARCHAR(255) NOT NULL COMMENT 'Snapshot: copied from appointment at queue entry creation',
  doctor_id        CHAR(36)     NOT NULL COMMENT 'FK to auth_service.users (role=DOCTOR)',
  doctor_name      VARCHAR(255) NOT NULL COMMENT 'Snapshot: copied from appointment at queue entry creation',
  status           ENUM(
                     'ARRIVED',
                     'WAITING',
                     'IN_CHAIR',
                     'DONE'
                   )          NOT NULL DEFAULT 'ARRIVED',
  arrived_at       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  called_at        DATETIME      NULL COMMENT 'When moved to WAITING',
  seated_at        DATETIME      NULL COMMENT 'When moved to IN_CHAIR',
  completed_at     DATETIME      NULL COMMENT 'When moved to DONE',
  updated_at       DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_queue_appointment   (appointment_id),
  INDEX idx_queue_clinic_status     (clinic_id, status),
  INDEX idx_queue_clinic_doctor     (clinic_id, doctor_id, status),
  INDEX idx_queue_clinic_date       (clinic_id, arrived_at)
);

CREATE TABLE outbox (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  event_type  VARCHAR(100) NOT NULL,
  payload     JSON         NOT NULL,
  published   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_outbox_unpublished (published, created_at)
);


-- =============================================================================
-- TREATMENT SERVICE
-- =============================================================================
CREATE DATABASE IF NOT EXISTS treatment_service;
USE treatment_service;

-- Admin-managed procedure catalog
CREATE TABLE act_catalog (
  id           CHAR(36)       NOT NULL DEFAULT (UUID()),
  clinic_id    CHAR(36)       NOT NULL,
  code         VARCHAR(50)    NOT NULL,
  name_ar      VARCHAR(255)   NOT NULL,
  name_fr      VARCHAR(255)   NOT NULL,
  name_en      VARCHAR(255)   NOT NULL,
  default_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active    BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_act_code_clinic (clinic_id, code),
  INDEX  idx_act_catalog_clinic  (clinic_id)
);

-- One visit record per appointment
CREATE TABLE visits (
  id             CHAR(36)       NOT NULL DEFAULT (UUID()),
  clinic_id      CHAR(36)       NOT NULL,
  appointment_id CHAR(36)       NOT NULL COMMENT 'FK to appointment_service.appointments',
  patient_id     CHAR(36)       NOT NULL COMMENT 'FK to patient_service.patients',
  patient_name   VARCHAR(255)   NOT NULL COMMENT 'Snapshot: for treatment record display',
  doctor_id      CHAR(36)       NOT NULL COMMENT 'FK to auth_service.users',
  doctor_name    VARCHAR(255)   NOT NULL COMMENT 'Snapshot: for treatment record display',
  assistant_id   CHAR(36)           NULL COMMENT 'FK to auth_service.users',
  assistant_name VARCHAR(255)       NULL COMMENT 'Snapshot: set when assistant is assigned',
  status         ENUM(
                   'OPEN',
                   'CONFIRMED',
                   'CLOSED'
                 )               NOT NULL DEFAULT 'OPEN',
  total_amount   DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  confirmed_at   DATETIME           NULL,
  confirmed_by   CHAR(36)           NULL COMMENT 'FK to auth_service.users (role=DOCTOR)',
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_visit_appointment   (appointment_id),
  INDEX idx_visits_clinic           (clinic_id),
  INDEX idx_visits_patient          (clinic_id, patient_id),
  INDEX idx_visits_doctor           (clinic_id, doctor_id),
  INDEX idx_visits_status           (clinic_id, status)
);

-- Individual procedure lines within a visit
CREATE TABLE treatment_acts (
  id              CHAR(36)       NOT NULL DEFAULT (UUID()),
  clinic_id       CHAR(36)       NOT NULL,
  visit_id        CHAR(36)       NOT NULL,
  act_catalog_id  CHAR(36)       NOT NULL,
  tooth_fdi       VARCHAR(10)        NULL COMMENT 'FDI tooth notation e.g. "11", "36"',
  quantity        TINYINT        NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10,2)  NOT NULL,
  notes           TEXT               NULL,
  entered_by      CHAR(36)       NOT NULL COMMENT 'FK to auth_service.users',
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_treatment_acts_visit   (visit_id),
  INDEX idx_treatment_acts_clinic  (clinic_id),
  CONSTRAINT fk_treatment_acts_visit        FOREIGN KEY (visit_id)       REFERENCES visits      (id) ON DELETE CASCADE,
  CONSTRAINT fk_treatment_acts_act_catalog  FOREIGN KEY (act_catalog_id) REFERENCES act_catalog (id)
);

CREATE TABLE outbox (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  event_type  VARCHAR(100) NOT NULL,
  payload     JSON         NOT NULL,
  published   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_outbox_unpublished (published, created_at)
);


-- =============================================================================
-- CHECKOUT SERVICE
-- =============================================================================
CREATE DATABASE IF NOT EXISTS checkout_service;
USE checkout_service;

CREATE TABLE invoices (
  id            CHAR(36)       NOT NULL DEFAULT (UUID()),
  clinic_id     CHAR(36)       NOT NULL,
  visit_id      CHAR(36)       NOT NULL COMMENT 'FK to treatment_service.visits',
  patient_id    CHAR(36)       NOT NULL COMMENT 'FK to patient_service.patients',
  patient_name  VARCHAR(255)   NOT NULL COMMENT 'Snapshot: for invoice/receipt display',
  total_amount  DECIMAL(10,2)  NOT NULL,
  paid_amount   DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  balance_due   DECIMAL(10,2)  NOT NULL GENERATED ALWAYS AS (total_amount - paid_amount) VIRTUAL,
  status        ENUM('PENDING','PARTIAL','PAID') NOT NULL DEFAULT 'PENDING',
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_invoice_visit      (visit_id),
  INDEX idx_invoices_clinic        (clinic_id),
  INDEX idx_invoices_patient       (clinic_id, patient_id),
  INDEX idx_invoices_status        (clinic_id, status)
);

CREATE TABLE payments (
  id          CHAR(36)       NOT NULL DEFAULT (UUID()),
  clinic_id   CHAR(36)       NOT NULL,
  invoice_id  CHAR(36)       NOT NULL,
  amount      DECIMAL(10,2)  NOT NULL,
  method      ENUM('CASH','CARD','BANK_TRANSFER') NOT NULL DEFAULT 'CASH',
  notes       TEXT               NULL,
  created_by  CHAR(36)       NOT NULL COMMENT 'FK to auth_service.users',
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_payments_invoice  (invoice_id),
  INDEX idx_payments_clinic   (clinic_id),
  CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE RESTRICT
);

-- Running balance per patient per clinic (carry-forward)
CREATE TABLE patient_balances (
  id          CHAR(36)       NOT NULL DEFAULT (UUID()),
  clinic_id   CHAR(36)       NOT NULL,
  patient_id  CHAR(36)       NOT NULL COMMENT 'FK to patient_service.patients',
  balance     DECIMAL(10,2)  NOT NULL DEFAULT 0.00 COMMENT 'Negative = owes clinic, Positive = credit',
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_balance_patient_clinic (patient_id, clinic_id),
  INDEX idx_patient_balances_clinic    (clinic_id)
);

CREATE TABLE outbox (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  event_type  VARCHAR(100) NOT NULL,
  payload     JSON         NOT NULL,
  published   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_outbox_unpublished (published, created_at)
);


-- =============================================================================
-- NOTIFICATION SERVICE
-- =============================================================================
CREATE DATABASE IF NOT EXISTS notification_service;
USE notification_service;

CREATE TABLE notification_logs (
  id               CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id        CHAR(36)     NOT NULL,
  patient_id       CHAR(36)         NULL COMMENT 'FK to patient_service.patients',
  appointment_id   CHAR(36)         NULL COMMENT 'FK to appointment_service.appointments',
  type             ENUM(
                     'APPOINTMENT_CONFIRMATION',
                     'APPOINTMENT_REMINDER',
                     'APPOINTMENT_CANCELLATION'
                   )            NOT NULL,
  channel          ENUM('WHATSAPP','EMAIL') NOT NULL,
  recipient        VARCHAR(255) NOT NULL COMMENT 'Phone number or email address',
  status           ENUM('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
  error_message    TEXT             NULL,
  sent_at          DATETIME         NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_notification_logs_clinic       (clinic_id),
  INDEX idx_notification_logs_appointment  (appointment_id),
  INDEX idx_notification_logs_status       (status, created_at)
);


-- =============================================================================
-- AUDIT SERVICE  (append-only — no updates, no deletes)
-- =============================================================================
CREATE DATABASE IF NOT EXISTS audit_service;
USE audit_service;

CREATE TABLE audit_events (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  clinic_id    CHAR(36)     NOT NULL,
  user_id      CHAR(36)         NULL COMMENT 'Acting user — NULL for system events',
  event_type   VARCHAR(100) NOT NULL COMMENT 'e.g. patient.record.viewed, treatment.act.created',
  entity_type  VARCHAR(100) NOT NULL COMMENT 'e.g. patient, appointment, visit',
  entity_id    CHAR(36)     NOT NULL,
  payload      JSON         NOT NULL COMMENT 'Full event snapshot for compliance replay',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_audit_clinic       (clinic_id, created_at),
  INDEX idx_audit_entity       (clinic_id, entity_type, entity_id),
  INDEX idx_audit_user         (clinic_id, user_id, created_at)
  -- No FK constraints — audit store must be independent of other schemas
);
