import * as bcrypt from "bcryptjs";
import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedDefaultAdminUser20260415130000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY \`role\` ENUM('patient','secretary','doctor','admin','dental_assistant') NOT NULL
    `);

    if (process.env["DENTIFLOW_SEED_DEFAULT_ADMIN"] === "false") {
      return;
    }

    const clinicId =
      process.env["DEFAULT_ADMIN_CLINIC_ID"] ??
      "00000000-0000-4000-8000-000000000001";
    const email = process.env["DEFAULT_ADMIN_EMAIL"] ?? "admin@dentiflow.local";
    const password = process.env["DEFAULT_ADMIN_PASSWORD"] ?? "Admin123!";
    const fullName = process.env["DEFAULT_ADMIN_FULL_NAME"] ?? "DentiFlow Admin";
    const passwordHash = await bcrypt.hash(password, 12);

    await queryRunner.query(
      `
      INSERT INTO \`users\`
        (\`id\`, \`clinic_id\`, \`email\`, \`password_hash\`, \`full_name\`, \`role\`)
      VALUES
        (?, ?, ?, ?, ?, 'admin')
      ON DUPLICATE KEY UPDATE \`id\` = \`id\`
      `,
      [
        "00000000-0000-4000-8000-0000000000a1",
        clinicId,
        email,
        passwordHash,
        fullName,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const clinicId =
      process.env["DEFAULT_ADMIN_CLINIC_ID"] ??
      "00000000-0000-4000-8000-000000000001";
    const email = process.env["DEFAULT_ADMIN_EMAIL"] ?? "admin@dentiflow.local";

    await queryRunner.query(
      "DELETE FROM `users` WHERE `clinic_id` = ? AND `email` = ?",
      [clinicId, email],
    );
    await queryRunner.query(
      "UPDATE `users` SET `role` = 'secretary' WHERE `role` = 'dental_assistant'",
    );
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY \`role\` ENUM('patient','secretary','doctor','admin') NOT NULL
    `);
  }
}
