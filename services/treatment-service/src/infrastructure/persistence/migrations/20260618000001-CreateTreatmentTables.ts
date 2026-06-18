import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTreatmentTables20260618000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`act_catalog\` (
        \`id\`            VARCHAR(36) NOT NULL,
        \`clinic_id\`     VARCHAR(36) NOT NULL,
        \`code\`          VARCHAR(50) NOT NULL,
        \`name_ar\`       VARCHAR(255) NOT NULL,
        \`name_fr\`       VARCHAR(255) NOT NULL,
        \`name_en\`       VARCHAR(255) NOT NULL,
        \`default_price\` DECIMAL(12,2) NOT NULL,
        \`is_active\`     TINYINT(1) NOT NULL DEFAULT 1,
        \`icon\`          VARCHAR(80) NULL,
        \`created_at\`    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_act_catalog_clinic_code\` (\`clinic_id\`, \`code\`),
        INDEX \`idx_act_catalog_clinic\` (\`clinic_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`visits\` (
        \`id\`              VARCHAR(36) NOT NULL,
        \`clinic_id\`       VARCHAR(36) NOT NULL,
        \`appointment_id\`  VARCHAR(36) NOT NULL,
        \`patient_id\`      VARCHAR(36) NOT NULL,
        \`patient_name\`    VARCHAR(255) NOT NULL,
        \`doctor_id\`       VARCHAR(36) NOT NULL,
        \`doctor_name\`     VARCHAR(255) NOT NULL,
        \`assistant_id\`    VARCHAR(36) NULL,
        \`assistant_name\`  VARCHAR(255) NULL,
        \`status\`          ENUM('OPEN','CONFIRMED','CLOSED','VOIDED') NOT NULL DEFAULT 'OPEN',
        \`total_amount\`    DECIMAL(12,2) NOT NULL DEFAULT 0,
        \`confirmed_at\`    DATETIME NULL,
        \`confirmed_by\`    VARCHAR(36) NULL,
        \`voided_at\`       DATETIME NULL,
        \`void_reason\`     TEXT NULL,
        \`created_at\`      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_visits_clinic\` (\`clinic_id\`),
        INDEX \`idx_visits_clinic_patient\` (\`clinic_id\`, \`patient_id\`),
        INDEX \`idx_visits_clinic_doctor\` (\`clinic_id\`, \`doctor_id\`),
        INDEX \`idx_visits_clinic_status\` (\`clinic_id\`, \`status\`),
        INDEX \`idx_visits_appointment\` (\`appointment_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`treatment_acts\` (
        \`id\`             VARCHAR(36) NOT NULL,
        \`clinic_id\`      VARCHAR(36) NOT NULL,
        \`visit_id\`       VARCHAR(36) NOT NULL,
        \`act_catalog_id\` VARCHAR(36) NOT NULL,
        \`tooth_fdi\`      VARCHAR(10) NULL,
        \`quantity\`       INT NOT NULL DEFAULT 1,
        \`unit_price\`     DECIMAL(12,2) NOT NULL,
        \`surface\`        ENUM('OCCLUSAL','MESIAL','DISTAL','BUCCAL','LINGUAL','PALATAL') NULL,
        \`tooth_part\`     ENUM('CROWN','ROOT','WHOLE_TOOTH') NULL,
        \`dentition\`      ENUM('PERMANENT','PRIMARY','MIXED') NULL,
        \`status\`         ENUM('PLANNED','IN_PROGRESS','DONE','CANCELLED') NOT NULL DEFAULT 'PLANNED',
        \`notes\`          TEXT NULL,
        \`entered_by\`     VARCHAR(36) NOT NULL,
        \`created_at\`     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_treatment_acts_visit\` (\`visit_id\`),
        INDEX \`idx_treatment_acts_clinic\` (\`clinic_id\`),
        CONSTRAINT \`fk_treatment_acts_visit\`
          FOREIGN KEY (\`visit_id\`) REFERENCES \`visits\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_treatment_acts_act_catalog\`
          FOREIGN KEY (\`act_catalog_id\`) REFERENCES \`act_catalog\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`outbox\` (
        \`id\`         VARCHAR(36) NOT NULL,
        \`event_type\` VARCHAR(100) NOT NULL,
        \`payload\`    JSON NOT NULL,
        \`published\`  TINYINT(1) NOT NULL DEFAULT 0,
        \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_outbox_unpublished\` (\`published\`, \`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS `outbox`");
    await queryRunner.query("DROP TABLE IF EXISTS `treatment_acts`");
    await queryRunner.query("DROP TABLE IF EXISTS `visits`");
    await queryRunner.query("DROP TABLE IF EXISTS `act_catalog`");
  }
}
