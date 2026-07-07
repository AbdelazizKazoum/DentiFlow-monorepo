import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedDeterministicQueuePatients20260708000001
  implements MigrationInterface
{
  private readonly clinicId = "00000000-0000-4000-8000-000000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO \`patients\`
        (\`id\`, \`clinic_id\`, \`first_name\`, \`last_name\`, \`phone\`, \`email\`,
         \`date_of_birth\`, \`gender\`, \`address\`, \`allergies\`, \`chronic_conditions\`,
         \`current_medications\`, \`status\`, \`created_at\`, \`updated_at\`)
      VALUES
        (
          '00000000-0000-4000-8000-00000000c001',
          ?, 'Alice', 'Johnson', '555-0101', 'alice.j@example.com',
          '1985-06-15', 'FEMALE', '123 Main St, Springfield', 'Penicillin',
          'Hypertension', NULL, 'ACTIVE', NOW(), NOW()
        ),
        (
          '00000000-0000-4000-8000-00000000c002',
          ?, 'Michael', 'Chen', '555-0203', 'm.chen@example.com',
          '1992-11-22', 'MALE', NULL, NULL, NULL, NULL, 'ACTIVE', NOW(), NOW()
        ),
        (
          '00000000-0000-4000-8000-00000000c003',
          ?, 'Sarah', 'Williams', '555-0305', 'sarah.w@example.com',
          '1978-03-08', 'FEMALE', NULL, 'Latex', 'Diabetes Type 2', NULL,
          'INACTIVE', NOW(), NOW()
        )
      ON DUPLICATE KEY UPDATE
        \`clinic_id\` = VALUES(\`clinic_id\`),
        \`first_name\` = VALUES(\`first_name\`),
        \`last_name\` = VALUES(\`last_name\`),
        \`phone\` = VALUES(\`phone\`),
        \`email\` = VALUES(\`email\`),
        \`date_of_birth\` = VALUES(\`date_of_birth\`),
        \`gender\` = VALUES(\`gender\`),
        \`address\` = VALUES(\`address\`),
        \`allergies\` = VALUES(\`allergies\`),
        \`chronic_conditions\` = VALUES(\`chronic_conditions\`),
        \`current_medications\` = VALUES(\`current_medications\`),
        \`status\` = VALUES(\`status\`),
        \`updated_at\` = NOW()
      `,
      [this.clinicId, this.clinicId, this.clinicId],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      DELETE FROM \`patients\`
      WHERE \`id\` IN (
        '00000000-0000-4000-8000-00000000c001',
        '00000000-0000-4000-8000-00000000c002',
        '00000000-0000-4000-8000-00000000c003'
      )
      `,
    );
  }
}
