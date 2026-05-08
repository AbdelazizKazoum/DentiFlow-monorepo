import {MigrationInterface, QueryRunner} from "typeorm";

export class CreatePatientTables20260508000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`patients\` (
        \`id\`                   VARCHAR(36) NOT NULL DEFAULT (UUID()),
        \`clinic_id\`            VARCHAR(36) NOT NULL,
        \`user_id\`              VARCHAR(36) NULL,
        \`first_name\`           VARCHAR(100) NOT NULL,
        \`last_name\`            VARCHAR(100) NOT NULL,
        \`phone\`                VARCHAR(30) NULL,
        \`email\`                VARCHAR(255) NULL,
        \`date_of_birth\`        DATE NULL,
        \`gender\`               ENUM('MALE','FEMALE','OTHER') NULL,
        \`address\`              TEXT NULL,
        \`notes\`                TEXT NULL,
        \`allergies\`            TEXT NULL,
        \`chronic_conditions\`   TEXT NULL,
        \`current_medications\`  TEXT NULL,
        \`medical_notes\`        TEXT NULL,
        \`status\`               ENUM('ACTIVE','INACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
        \`deleted_at\`           DATETIME NULL,
        \`created_at\`           DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`           DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_patients_clinic\` (\`clinic_id\`),
        INDEX \`idx_patients_user\` (\`user_id\`),
        INDEX \`idx_patients_phone\` (\`clinic_id\`, \`phone\`),
        INDEX \`idx_patients_name\` (\`clinic_id\`, \`last_name\`, \`first_name\`),
        INDEX \`idx_patients_status\` (\`clinic_id\`, \`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`insurance_providers\` (
        \`id\`          VARCHAR(36) NOT NULL DEFAULT (UUID()),
        \`clinic_id\`   VARCHAR(36) NOT NULL,
        \`name\`        VARCHAR(255) NOT NULL,
        \`code\`        VARCHAR(50) NULL,
        \`is_active\`   TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_insurance_name_clinic\` (\`clinic_id\`, \`name\`),
        INDEX \`idx_insurance_clinic\` (\`clinic_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`insurance_templates\` (
        \`id\`                    VARCHAR(36) NOT NULL DEFAULT (UUID()),
        \`insurance_provider_id\` VARCHAR(36) NOT NULL,
        \`name\`                  VARCHAR(255) NOT NULL,
        \`file_url\`              VARCHAR(500) NOT NULL,
        \`created_at\`            DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_templates_provider\` (\`insurance_provider_id\`),
        CONSTRAINT \`fk_templates_provider\`
          FOREIGN KEY (\`insurance_provider_id\`) REFERENCES \`insurance_providers\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`patient_insurances\` (
        \`id\`                    VARCHAR(36) NOT NULL DEFAULT (UUID()),
        \`clinic_id\`             VARCHAR(36) NOT NULL,
        \`patient_id\`            VARCHAR(36) NOT NULL,
        \`insurance_provider_id\` VARCHAR(36) NOT NULL,
        \`policy_number\`         VARCHAR(100) NULL,
        \`member_id\`             VARCHAR(100) NULL,
        \`is_active\`             TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\`            DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`            DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_patient_insurance_patient\` (\`clinic_id\`, \`patient_id\`),
        INDEX \`idx_patient_insurance_provider\` (\`clinic_id\`, \`insurance_provider_id\`),
        CONSTRAINT \`fk_patient_insurance_patient\`
          FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_patient_insurance_provider\`
          FOREIGN KEY (\`insurance_provider_id\`) REFERENCES \`insurance_providers\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`patient_documents\` (
        \`id\`          VARCHAR(36) NOT NULL DEFAULT (UUID()),
        \`clinic_id\`   VARCHAR(36) NOT NULL,
        \`patient_id\`  VARCHAR(36) NOT NULL,
        \`type\`        ENUM('GENERAL','INSURANCE','MEDICAL','OTHER') NOT NULL DEFAULT 'GENERAL',
        \`title\`       VARCHAR(255) NULL,
        \`file_url\`    VARCHAR(500) NOT NULL,
        \`created_at\`  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_documents_patient\` (\`clinic_id\`, \`patient_id\`),
        CONSTRAINT \`fk_documents_patient\`
          FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS `patient_documents`");
    await queryRunner.query("DROP TABLE IF EXISTS `patient_insurances`");
    await queryRunner.query("DROP TABLE IF EXISTS `insurance_templates`");
    await queryRunner.query("DROP TABLE IF EXISTS `insurance_providers`");
    await queryRunner.query("DROP TABLE IF EXISTS `patients`");
  }
}
