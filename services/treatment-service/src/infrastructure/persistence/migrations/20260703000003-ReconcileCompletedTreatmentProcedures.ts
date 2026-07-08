import {MigrationInterface, QueryRunner} from "typeorm";

export class ReconcileCompletedTreatmentProcedures20260703000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE visit_procedures vp
      INNER JOIN treatment_plan_items tpi
        ON tpi.id = vp.treatment_plan_item_id
       AND tpi.clinic_id = vp.clinic_id
       AND tpi.patient_id = vp.patient_id
      SET
        vp.status = 'COMPLETED',
        vp.action = 'COMPLETED',
        vp.completed_at = COALESCE(tpi.completed_at, vp.completed_at, NOW())
      WHERE vp.status = 'IN_PROGRESS'
        AND tpi.status = 'COMPLETED'
    `);
  }

  public async down(): Promise<void> {
    // Data reconciliation is intentionally not reversed.
  }
}
