import {TreatmentAct} from "../../../domain/entities/treatment-act";
import {TreatmentActTypeOrmEntity} from "../entities/treatment-act.typeorm-entity";

export class TreatmentActMapper {
  static toDomain(entity: TreatmentActTypeOrmEntity): TreatmentAct {
    return new TreatmentAct(
      entity.id,
      entity.clinic_id,
      entity.visit_id,
      entity.act_catalog_id,
      entity.tooth_fdi,
      entity.quantity,
      Number(entity.unit_price),
      entity.surface,
      entity.tooth_part,
      entity.dentition,
      entity.status,
      entity.notes,
      entity.entered_by,
      entity.created_at,
      entity.updated_at,
    );
  }
}
