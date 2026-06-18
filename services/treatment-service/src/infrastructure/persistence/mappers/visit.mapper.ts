import {Visit} from "../../../domain/entities/visit";
import {VisitTypeOrmEntity} from "../entities/visit.typeorm-entity";

export class VisitMapper {
  static toDomain(entity: VisitTypeOrmEntity): Visit {
    return new Visit(
      entity.id,
      entity.clinic_id,
      entity.appointment_id,
      entity.patient_id,
      entity.patient_name,
      entity.doctor_id,
      entity.doctor_name,
      entity.assistant_id,
      entity.assistant_name,
      entity.status,
      Number(entity.total_amount),
      entity.confirmed_at,
      entity.confirmed_by,
      entity.voided_at,
      entity.void_reason,
      entity.created_at,
      entity.updated_at,
    );
  }
}
