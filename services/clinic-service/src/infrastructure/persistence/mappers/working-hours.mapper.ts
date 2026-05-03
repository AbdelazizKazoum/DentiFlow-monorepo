import {WorkingHours} from "../../../domain/entities/working-hours";
import {WorkingHoursTypeOrmEntity} from "../entities/working-hours.typeorm-entity";

export class WorkingHoursMapper {
  static toDomain(e: WorkingHoursTypeOrmEntity): WorkingHours {
    return new WorkingHours(
      e.id,
      e.clinic_id,
      e.day_of_week,
      e.open_time,
      e.close_time,
      e.is_closed,
    );
  }

  static toEntity(d: WorkingHours): Partial<WorkingHoursTypeOrmEntity> {
    return {
      id: d.id || undefined,
      clinic_id: d.clinicId,
      day_of_week: d.dayOfWeek,
      open_time: d.openTime,
      close_time: d.closeTime,
      is_closed: d.isClosed,
    };
  }
}
