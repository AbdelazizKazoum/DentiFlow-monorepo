import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedActCatalog20260618000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT IGNORE INTO \`act_catalog\`
        (\`clinic_id\`, \`code\`, \`name_ar\`, \`name_fr\`, \`name_en\`, \`default_price\`, \`is_active\`)
      VALUES
        ('default-clinic', 'CONS', 'استشارة', 'Consultation', 'Consultation', 200.00, 1),
        ('default-clinic', 'DET', 'تنظيف الأسنان', 'Detartrage', 'Scaling', 300.00, 1),
        ('default-clinic', 'FILL', 'حشوة', 'Obturation', 'Filling', 500.00, 1),
        ('default-clinic', 'EXT', 'خلع سن', 'Extraction', 'Extraction', 400.00, 1);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`act_catalog\`
      WHERE \`clinic_id\` = 'default-clinic'
        AND \`code\` IN ('CONS', 'DET', 'FILL', 'EXT');
    `);
  }
}
