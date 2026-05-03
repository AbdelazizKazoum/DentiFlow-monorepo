import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateClinicTables20260503120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`clinics\` (
        \`id\`         VARCHAR(36)                     NOT NULL DEFAULT (UUID()),
        \`slug\`       VARCHAR(100)                    NOT NULL,
        \`name\`       VARCHAR(255)                    NOT NULL,
        \`phone\`      VARCHAR(30)                         NULL,
        \`email\`      VARCHAR(255)                        NULL,
        \`address\`    TEXT                                NULL,
        \`timezone\`   VARCHAR(60)                     NOT NULL DEFAULT 'Africa/Algiers',
        \`locale\`     ENUM('ar','fr','en')            NOT NULL DEFAULT 'fr',
        \`is_active\`  TINYINT(1)                      NOT NULL DEFAULT 1,
        \`created_at\` DATETIME(6)                     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` DATETIME(6)                     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_clinics_slug\` (\`slug\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`working_hours\` (
        \`id\`          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
        \`clinic_id\`   VARCHAR(36)  NOT NULL,
        \`day_of_week\` TINYINT      NOT NULL COMMENT '0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat',
        \`open_time\`   TIME             NULL,
        \`close_time\`  TIME             NULL,
        \`is_closed\`   TINYINT(1)   NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_working_hours_day\` (\`clinic_id\`, \`day_of_week\`),
        INDEX \`idx_working_hours_clinic\` (\`clinic_id\`),
        CONSTRAINT \`fk_working_hours_clinic\`
          FOREIGN KEY (\`clinic_id\`) REFERENCES \`clinics\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`staff_members\` (
        \`id\`             VARCHAR(36)                                               NOT NULL DEFAULT (UUID()),
        \`clinic_id\`      VARCHAR(36)                                               NOT NULL,
        \`user_id\`        VARCHAR(36)                                               NOT NULL COMMENT 'FK to auth_service.users',
        \`role\`           ENUM('SECRETARY','DENTAL_ASSISTANT','DOCTOR','ADMIN')     NOT NULL,
        \`status\`         ENUM('active','on-leave','inactive')                      NOT NULL DEFAULT 'active',
        \`first_name\`     VARCHAR(100)                                              NOT NULL,
        \`last_name\`      VARCHAR(100)                                              NOT NULL,
        \`phone\`          VARCHAR(30)                                                   NULL,
        \`email\`          VARCHAR(255)                                                  NULL,
        \`specialization\` VARCHAR(255)                                                  NULL,
        \`avatar\`         VARCHAR(500)                                                  NULL,
        \`is_active\`      TINYINT(1)                                                NOT NULL DEFAULT 1,
        \`created_at\`     DATETIME(6)                                               NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`     DATETIME(6)                                               NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_staff_user_clinic\`  (\`user_id\`, \`clinic_id\`),
        INDEX \`idx_staff_clinic\`           (\`clinic_id\`),
        INDEX \`idx_staff_role\`             (\`clinic_id\`, \`role\`),
        INDEX \`idx_staff_status\`           (\`clinic_id\`, \`status\`),
        INDEX \`idx_staff_name\`             (\`clinic_id\`, \`last_name\`, \`first_name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`staff_members\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`working_hours\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`clinics\``);
  }
}
