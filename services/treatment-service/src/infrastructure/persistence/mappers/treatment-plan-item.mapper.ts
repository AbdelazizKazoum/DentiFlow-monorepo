import {TreatmentPlanItem} from "../../../domain/entities/treatment-plan-item";
import {TreatmentPlanItemTypeOrmEntity} from "../entities/treatment-plan-item.typeorm-entity";

export class TreatmentPlanItemMapper {
  static toDomain(entity: TreatmentPlanItemTypeOrmEntity): TreatmentPlanItem {
    return new TreatmentPlanItem(entity.id, entity.clinic_id, entity.patient_id, entity.act_catalog_id, entity.tooth_fdi, entity.surface, entity.tooth_part, entity.dentition, entity.status, entity.diagnosis_notes, entity.created_visit_id, entity.completed_visit_id, entity.created_by, entity.completed_by, entity.created_at, entity.updated_at);
  }
}
