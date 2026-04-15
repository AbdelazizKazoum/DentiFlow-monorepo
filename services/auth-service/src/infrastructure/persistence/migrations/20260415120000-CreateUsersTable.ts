import {MigrationInterface, QueryRunner, Table, TableUnique} from "typeorm";

export class CreateUsersTable20260415120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\`            VARCHAR(36)                                                   NOT NULL,
        \`clinic_id\`     VARCHAR(36)                                                   NOT NULL,
        \`email\`         VARCHAR(255)                                                  NOT NULL,
        \`password_hash\` VARCHAR(255)                                                  NOT NULL,
        \`full_name\`     VARCHAR(255)                                                  NOT NULL,
        \`role\`          ENUM('patient','secretary','doctor','admin')                  NOT NULL,
        \`created_at\`    DATETIME(6)                                                   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`    DATETIME(6)                                                   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_users_email_clinic_id\` (\`email\`, \`clinic_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}
