import {MigrationInterface, QueryRunner} from "typeorm";

const defaultClinicId = "00000000-0000-4000-8000-000000000001";

const legacyActs = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    code: "DIA-01",
    nameAr: "تسوس",
    nameFr: "Carie",
    nameEn: "Caries",
    defaultPrice: "180.00",
    icon: "AlertCircle",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    code: "RES-12",
    nameAr: "حشوة",
    nameFr: "Obturation",
    nameEn: "Filling",
    defaultPrice: "520.00",
    icon: "CircleDot",
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    code: "PRO-40",
    nameAr: "تاج",
    nameFr: "Couronne",
    nameEn: "Crown",
    defaultPrice: "2400.00",
    icon: "Crown",
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    code: "SUR-90",
    nameAr: "زرعة",
    nameFr: "Implant",
    nameEn: "Implant",
    defaultPrice: "7800.00",
    icon: "Anchor",
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    code: "SUR-20",
    nameAr: "خلع",
    nameFr: "Extraction",
    nameEn: "Extraction",
    defaultPrice: "650.00",
    icon: "X",
  },
  {
    id: "00000000-0000-4000-8000-000000000106",
    code: "END-31",
    nameAr: "علاج الجذور",
    nameFr: "Traitement canalaire",
    nameEn: "Root Canal",
    defaultPrice: "1800.00",
    icon: "Zap",
  },
  {
    id: "00000000-0000-4000-8000-000000000107",
    code: "COS-10",
    nameAr: "تبييض",
    nameFr: "Blanchiment",
    nameEn: "Whitening",
    defaultPrice: "1200.00",
    icon: "Sun",
  },
  {
    id: "00000000-0000-4000-8000-000000000108",
    code: "ORT-70",
    nameAr: "تقويم",
    nameFr: "Orthodontie",
    nameEn: "Orthodontics",
    defaultPrice: "3200.00",
    icon: "GitCommitHorizontal",
  },
];

export class SeedLegacyActCatalogIcons20260618000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasIconColumn = await queryRunner.hasColumn("act_catalog", "icon");
    if (!hasIconColumn) {
      await queryRunner.query(
        "ALTER TABLE `act_catalog` ADD COLUMN `icon` VARCHAR(80) NULL AFTER `is_active`",
      );
    }

    for (const act of legacyActs) {
      await queryRunner.query(
        `
          INSERT INTO \`act_catalog\`
            (\`id\`, \`clinic_id\`, \`code\`, \`name_ar\`, \`name_fr\`, \`name_en\`, \`default_price\`, \`is_active\`, \`icon\`)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
          ON DUPLICATE KEY UPDATE
            \`icon\` = VALUES(\`icon\`)
        `,
        [
          act.id,
          defaultClinicId,
          act.code,
          act.nameAr,
          act.nameFr,
          act.nameEn,
          act.defaultPrice,
          act.icon,
        ],
      );
    }

    await queryRunner.query(`
      UPDATE \`act_catalog\`
      SET \`icon\` = CASE \`code\`
        WHEN 'CONS' THEN 'Stethoscope'
        WHEN 'DET' THEN 'Sparkles'
        WHEN 'FILL' THEN 'CircleDot'
        WHEN 'EXT' THEN 'X'
        ELSE \`icon\`
      END
      WHERE \`icon\` IS NULL
        AND \`code\` IN ('CONS', 'DET', 'FILL', 'EXT');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        DELETE FROM \`act_catalog\`
        WHERE \`clinic_id\` = ?
          AND \`code\` IN (${legacyActs.map(() => "?").join(", ")})
          AND \`id\` IN (${legacyActs.map(() => "?").join(", ")})
      `,
      [
        defaultClinicId,
        ...legacyActs.map((act) => act.code),
        ...legacyActs.map((act) => act.id),
      ],
    );

    await queryRunner.query(`
      UPDATE \`act_catalog\`
      SET \`icon\` = NULL
      WHERE \`code\` IN ('CONS', 'DET', 'FILL', 'EXT');
    `);
  }
}
