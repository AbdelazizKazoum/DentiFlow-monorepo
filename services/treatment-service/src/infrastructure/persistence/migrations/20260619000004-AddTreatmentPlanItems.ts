import {MigrationInterface, QueryRunner} from "typeorm";

/** Adds the patient-level clinical aggregate without deleting legacy visit acts. */
export class AddTreatmentPlanItems20260619000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`treatment_plan_items\` (
      \`id\` VARCHAR(36) NOT NULL, \`clinic_id\` VARCHAR(36) NOT NULL, \`patient_id\` VARCHAR(36) NOT NULL,
      \`act_catalog_id\` VARCHAR(36) NOT NULL, \`tooth_fdi\` VARCHAR(10) NULL,
      \`surface\` ENUM('OCCLUSAL','MESIAL','DISTAL','BUCCAL','LINGUAL','PALATAL') NULL,
      \`tooth_part\` ENUM('CROWN','ROOT','WHOLE_TOOTH') NULL, \`dentition\` ENUM('PERMANENT','PRIMARY','MIXED') NULL,
      \`status\` ENUM('PLANNED','IN_PROGRESS','DONE','CANCELLED') NOT NULL DEFAULT 'PLANNED',
      \`diagnosis_notes\` TEXT NULL, \`created_visit_id\` VARCHAR(36) NOT NULL, \`completed_visit_id\` VARCHAR(36) NULL,
      \`created_by\` VARCHAR(36) NOT NULL, \`completed_by\` VARCHAR(36) NULL,
      \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      PRIMARY KEY (\`id\`), INDEX \`idx_treatment_plan_patient\` (\`clinic_id\`, \`patient_id\`),
      INDEX \`idx_treatment_plan_patient_status\` (\`clinic_id\`, \`patient_id\`, \`status\`),
      INDEX \`idx_treatment_plan_patient_tooth\` (\`clinic_id\`, \`patient_id\`, \`tooth_fdi\`),
      CONSTRAINT \`fk_treatment_plan_catalog\` FOREIGN KEY (\`act_catalog_id\`) REFERENCES \`act_catalog\` (\`id\`) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await queryRunner.query("ALTER TABLE `treatment_acts` ADD COLUMN `treatment_plan_item_id` VARCHAR(36) NULL AFTER `visit_id`, ADD COLUMN `action_type` ENUM('PLANNED','PERFORMED','AMENDED','CANCELLED') NOT NULL DEFAULT 'PERFORMED' AFTER `status`, ADD INDEX `idx_treatment_acts_plan_item` (`treatment_plan_item_id`), ADD CONSTRAINT `fk_treatment_acts_plan_item` FOREIGN KEY (`treatment_plan_item_id`) REFERENCES `treatment_plan_items` (`id`) ON DELETE RESTRICT");
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `treatment_acts` DROP FOREIGN KEY `fk_treatment_acts_plan_item`, DROP INDEX `idx_treatment_acts_plan_item`, DROP COLUMN `action_type`, DROP COLUMN `treatment_plan_item_id`");
    await queryRunner.query("DROP TABLE `treatment_plan_items`");
  }
}
