import {MigrationInterface, QueryRunner} from "typeorm";

const treatmentActs = [
  ["a1", "Consultation", "GENERAL", 50, false, null, false],
  ["a2", "Panoramic X-Ray", "RADIOGRAPHY", 80, false, null, false],
  ["a3", "Scaling and Polishing", "PREVENTIVE", 120, true, null, false],
  ["a4", "Fluoride Treatment", "PREVENTIVE", 60, true, null, false],
  ["a5", "Composite Filling (1 Surface)", "RESTORATIVE", 80, false, null, true],
  ["a6", "Composite Filling (2 Surfaces)", "RESTORATIVE", 120, false, null, true],
  ["a7", "Composite Filling (3+ Surfaces)", "RESTORATIVE", 160, false, null, true],
  ["a8", "Root Canal Treatment (Anterior)", "ENDODONTICS", 250, false, null, true],
  ["a9", "Root Canal Treatment (Premolar)", "ENDODONTICS", 350, false, null, true],
  ["a10", "Root Canal Treatment (Molar)", "ENDODONTICS", 450, false, null, true],
  ["a11", "Simple Extraction", "SURGERY", 100, false, "extraction", true],
  ["a12", "Surgical Extraction", "SURGERY", 250, false, "extraction", true],
  ["a13", "Wisdom Tooth Extraction", "SURGERY", 350, false, "extraction", true],
  ["a14", "Ceramic Crown", "PROSTHETICS", 600, false, "crown", true],
  ["a15", "Zirconia Crown", "PROSTHETICS", 800, false, "crown", true],
  ["a16", "Temporary Crown", "PROSTHETICS", 150, false, "crown", true],
  ["a17", "Dental Implant Placement", "SURGERY", 1200, false, "implant", true],
  ["a18", "Bone Grafting", "SURGERY", 400, false, "graft", true],
  ["a19", "Teeth Whitening (In-Office)", "AESTHETIC", 300, true, null, false],
  ["a20", "Orthodontic Consultation", "ORTHODONTICS", 80, false, null, false],
] as const;

export class SeedTreatmentActs20260703000002 implements MigrationInterface {
  name = "SeedTreatmentActs20260703000002";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE treatment_acts
      SET active = 0
      WHERE clinic_id IS NOT NULL
        AND TRIM(name) = ''
    `);

    for (const [
      id,
      name,
      category,
      price,
      groupableTeeth,
      visualType,
      affectsTooth,
    ] of treatmentActs) {
      await queryRunner.query(
        `
          INSERT INTO treatment_acts (
            id,
            clinic_id,
            name,
            category,
            price,
            groupable_teeth,
            visual_type,
            affects_tooth,
            default_surfaces,
            active
          )
          VALUES (?, NULL, ?, ?, ?, ?, ?, ?, NULL, 1)
          ON DUPLICATE KEY UPDATE
            clinic_id = VALUES(clinic_id),
            name = VALUES(name),
            category = VALUES(category),
            price = VALUES(price),
            groupable_teeth = VALUES(groupable_teeth),
            visual_type = VALUES(visual_type),
            affects_tooth = VALUES(affects_tooth),
            active = VALUES(active)
        `,
        [
          id,
          name,
          category,
          price,
          groupableTeeth ? 1 : 0,
          visualType,
          affectsTooth ? 1 : 0,
        ],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        DELETE FROM treatment_acts
        WHERE clinic_id IS NULL
          AND id IN (${treatmentActs.map(() => "?").join(", ")})
      `,
      treatmentActs.map(([id]) => id),
    );
  }
}
