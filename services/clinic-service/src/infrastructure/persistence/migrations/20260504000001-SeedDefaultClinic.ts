import {MigrationInterface, QueryRunner} from "typeorm";

/**
 * Seeds one default clinic to use during local development and testing.
 * The UUID is fixed so dependent seeds and tests can reference it directly.
 *
 * Clinic ID: 00000000-0000-4000-8000-000000000001  (valid UUID v4-format)
 * Slug:      default-clinic
 */
export class SeedDefaultClinic20260504000001 implements MigrationInterface {
  private readonly CLINIC_ID = "00000000-0000-4000-8000-000000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO \`clinics\`
        (\`id\`, \`slug\`, \`name\`, \`phone\`, \`email\`, \`address\`, \`timezone\`, \`locale\`, \`is_active\`)
      VALUES
        (?, 'default-clinic', 'Default Clinic', '+213 21 00 00 00', 'contact@default-clinic.dz',
         '1 Rue de la Santé, Alger, Algérie', 'Africa/Algiers', 'fr', 1)
      ON DUPLICATE KEY UPDATE \`id\` = \`id\`
      `,
      [this.CLINIC_ID],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM \`clinics\` WHERE \`id\` = ?`, [
      this.CLINIC_ID,
    ]);
  }
}
