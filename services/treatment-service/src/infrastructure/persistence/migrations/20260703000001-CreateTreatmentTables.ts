import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTreatmentTables20260703000001 implements MigrationInterface {
  name = "CreateTreatmentTables20260703000001";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE treatment_acts (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NULL,
        name varchar(255) NOT NULL,
        category varchar(40) NOT NULL,
        price decimal(10,2) NOT NULL,
        groupable_teeth tinyint(1) NOT NULL DEFAULT 0,
        visual_type varchar(40) NULL,
        affects_tooth tinyint(1) NOT NULL DEFAULT 1,
        default_surfaces json NULL,
        active tinyint(1) NOT NULL DEFAULT 1,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_treatment_acts_clinic_category (clinic_id, category),
        INDEX idx_treatment_acts_active (active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE visits (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        queue_entry_id varchar(36) NULL,
        appointment_id varchar(36) NULL,
        chair_id varchar(36) NOT NULL,
        provider_id varchar(36) NOT NULL,
        status varchar(30) NOT NULL DEFAULT 'OPEN',
        source varchar(20) NOT NULL DEFAULT 'QUEUE',
        started_at datetime NOT NULL,
        closed_at datetime NULL,
        cancelled_at datetime NULL,
        cancellation_reason text NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX uq_visits_queue_entry (queue_entry_id),
        INDEX idx_visits_clinic_patient_status (clinic_id, patient_id, status),
        INDEX idx_visits_clinic_queue (clinic_id, queue_entry_id),
        INDEX idx_visits_clinic_started_at (clinic_id, started_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE treatment_groups (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        act_id varchar(36) NOT NULL,
        act_name varchar(255) NOT NULL,
        tooth_ids json NOT NULL,
        billing_mode varchar(20) NOT NULL,
        created_at datetime NOT NULL,
        created_by varchar(36) NOT NULL,
        INDEX idx_treatment_groups_patient (clinic_id, patient_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE treatment_plan_items (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        act_id varchar(36) NOT NULL,
        act_name varchar(255) NOT NULL,
        price decimal(10,2) NOT NULL,
        priority varchar(20) NOT NULL,
        status varchar(30) NOT NULL,
        location json NOT NULL,
        notes text NULL,
        treatment_group_id varchar(36) NULL,
        visit_procedure_ids json NOT NULL,
        charge_id varchar(36) NULL,
        billing_status varchar(20) NOT NULL DEFAULT 'NOT_CHARGED',
        created_at datetime NOT NULL,
        created_by varchar(36) NOT NULL,
        started_at datetime NULL,
        completed_at datetime NULL,
        cancelled_at datetime NULL,
        cancellation_reason text NULL,
        voided_at datetime NULL,
        void_reason text NULL,
        status_changed_at datetime NULL,
        status_changed_by varchar(36) NULL,
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_treatment_plan_patient_status (clinic_id, patient_id, status),
        INDEX idx_treatment_plan_group (treatment_group_id),
        INDEX idx_treatment_plan_charge (charge_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE visit_procedures (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        visit_id varchar(36) NOT NULL,
        treatment_plan_item_id varchar(36) NOT NULL,
        act_id varchar(36) NOT NULL,
        act_name varchar(255) NOT NULL,
        location json NOT NULL,
        status varchar(20) NOT NULL,
        action varchar(20) NOT NULL,
        notes text NULL,
        performed_at datetime NOT NULL,
        completed_at datetime NULL,
        provider_id varchar(36) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_visit_procedures_visit (visit_id),
        INDEX idx_visit_procedures_plan_item (treatment_plan_item_id),
        INDEX idx_visit_procedures_patient (clinic_id, patient_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE diagnoses (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        diagnosis varchar(255) NOT NULL,
        location json NOT NULL,
        severity varchar(20) NOT NULL,
        certainty varchar(20) NOT NULL,
        status varchar(20) NOT NULL,
        evidence json NOT NULL,
        attachment_ids json NOT NULL,
        symptoms json NOT NULL,
        pain_level int NOT NULL DEFAULT 0,
        notes text NULL,
        created_at datetime NOT NULL,
        created_by varchar(36) NOT NULL,
        INDEX idx_diagnoses_patient_status (clinic_id, patient_id, status),
        INDEX idx_diagnoses_created_at (clinic_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE clinical_attachments (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        visit_id varchar(36) NULL,
        type varchar(20) NOT NULL,
        title varchar(255) NOT NULL,
        file_name varchar(255) NOT NULL,
        mime_type varchar(100) NOT NULL,
        file_url text NOT NULL,
        uploaded_at datetime NOT NULL,
        uploaded_by varchar(36) NOT NULL,
        INDEX idx_attachments_patient (clinic_id, patient_id),
        INDEX idx_attachments_visit (visit_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE visit_handoffs (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        visit_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        treatment_plan_item_id varchar(36) NULL,
        text text NOT NULL,
        status varchar(30) NOT NULL,
        authored_by varchar(36) NOT NULL,
        saved_at datetime NOT NULL,
        coded_at datetime NULL,
        coded_by varchar(36) NULL,
        INDEX idx_handoffs_visit (visit_id),
        INDEX idx_handoffs_patient (clinic_id, patient_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE treatment_charges (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        visit_id varchar(36) NOT NULL,
        source_type varchar(40) NOT NULL,
        source_id varchar(36) NOT NULL,
        label varchar(255) NOT NULL,
        location_label varchar(255) NOT NULL,
        original_amount decimal(10,2) NOT NULL,
        paid_amount decimal(10,2) NOT NULL DEFAULT 0,
        remaining_amount decimal(10,2) NOT NULL,
        status varchar(30) NOT NULL,
        created_at datetime NOT NULL,
        created_by varchar(36) NOT NULL,
        INDEX idx_treatment_charges_patient (clinic_id, patient_id, status),
        INDEX idx_treatment_charges_visit (visit_id),
        INDEX idx_treatment_charges_source (source_type, source_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE follow_up_requests (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        visit_id varchar(36) NOT NULL,
        treatment_plan_item_id varchar(36) NULL,
        reason text NULL,
        preferred_date date NULL,
        urgency varchar(20) NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'REQUESTED',
        requested_at datetime NOT NULL,
        requested_by varchar(36) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE medical_document_requests (
        id varchar(36) NOT NULL PRIMARY KEY,
        clinic_id varchar(36) NOT NULL,
        patient_id varchar(36) NOT NULL,
        visit_id varchar(36) NOT NULL,
        treatment_plan_item_id varchar(36) NULL,
        type varchar(40) NOT NULL,
        reason text NULL,
        status varchar(20) NOT NULL DEFAULT 'REQUESTED',
        requested_at datetime NOT NULL,
        requested_by varchar(36) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      CREATE TABLE outbox (
        id varchar(36) NOT NULL PRIMARY KEY,
        event_type varchar(100) NOT NULL,
        payload json NOT NULL,
        published tinyint(1) NOT NULL DEFAULT 0,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX idx_outbox_unpublished (published, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await queryRunner.query(`
      INSERT INTO treatment_acts
        (id, clinic_id, name, category, price, groupable_teeth, visual_type, affects_tooth, default_surfaces, active)
      VALUES
        ('a1', NULL, 'Consultation', 'GENERAL', 50.00, 0, NULL, 0, NULL, 1),
        ('a2', NULL, 'Panoramic X-Ray', 'RADIOGRAPHY', 80.00, 0, NULL, 0, NULL, 1),
        ('a3', NULL, 'Scaling and Polishing', 'PREVENTIVE', 120.00, 1, NULL, 0, NULL, 1),
        ('a4', NULL, 'Fluoride Treatment', 'PREVENTIVE', 60.00, 1, NULL, 0, NULL, 1),
        ('a5', NULL, 'Composite Filling (1 Surface)', 'RESTORATIVE', 80.00, 0, 'filling', 1, NULL, 1),
        ('a6', NULL, 'Composite Filling (2 Surfaces)', 'RESTORATIVE', 120.00, 0, 'filling', 1, NULL, 1),
        ('a7', NULL, 'Composite Filling (3+ Surfaces)', 'RESTORATIVE', 160.00, 0, 'filling', 1, NULL, 1),
        ('a8', NULL, 'Root Canal Treatment (Anterior)', 'ENDODONTICS', 250.00, 0, 'root_canal', 1, NULL, 1),
        ('a9', NULL, 'Root Canal Treatment (Premolar)', 'ENDODONTICS', 350.00, 0, 'root_canal', 1, NULL, 1),
        ('a10', NULL, 'Root Canal Treatment (Molar)', 'ENDODONTICS', 450.00, 0, 'root_canal', 1, NULL, 1),
        ('a11', NULL, 'Simple Extraction', 'SURGERY', 100.00, 0, 'extraction', 1, NULL, 1),
        ('a12', NULL, 'Surgical Extraction', 'SURGERY', 250.00, 0, 'extraction', 1, NULL, 1),
        ('a13', NULL, 'Wisdom Tooth Extraction', 'SURGERY', 350.00, 0, 'extraction', 1, NULL, 1),
        ('a14', NULL, 'Ceramic Crown', 'PROSTHETICS', 600.00, 0, 'crown', 1, NULL, 1),
        ('a15', NULL, 'Zirconia Crown', 'PROSTHETICS', 800.00, 0, 'crown', 1, NULL, 1),
        ('a16', NULL, 'Temporary Crown', 'PROSTHETICS', 150.00, 0, 'crown', 1, NULL, 1),
        ('a17', NULL, 'Dental Implant Placement', 'SURGERY', 1200.00, 0, 'implant', 1, NULL, 1),
        ('a18', NULL, 'Bone Grafting', 'SURGERY', 400.00, 0, 'graft', 1, NULL, 1),
        ('a19', NULL, 'Teeth Whitening (In-Office)', 'AESTHETIC', 300.00, 1, NULL, 0, NULL, 1),
        ('a20', NULL, 'Orthodontic Consultation', 'ORTHODONTICS', 80.00, 0, NULL, 0, NULL, 1)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE outbox");
    await queryRunner.query("DROP TABLE medical_document_requests");
    await queryRunner.query("DROP TABLE follow_up_requests");
    await queryRunner.query("DROP TABLE treatment_charges");
    await queryRunner.query("DROP TABLE visit_handoffs");
    await queryRunner.query("DROP TABLE clinical_attachments");
    await queryRunner.query("DROP TABLE diagnoses");
    await queryRunner.query("DROP TABLE visit_procedures");
    await queryRunner.query("DROP TABLE treatment_plan_items");
    await queryRunner.query("DROP TABLE treatment_groups");
    await queryRunner.query("DROP TABLE visits");
    await queryRunner.query("DROP TABLE treatment_acts");
  }
}
