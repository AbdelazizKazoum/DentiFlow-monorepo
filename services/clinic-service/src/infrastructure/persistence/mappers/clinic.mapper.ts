import {Clinic} from "../../../domain/entities/clinic";
import {ClinicTypeOrmEntity} from "../entities/clinic.typeorm-entity";

export class ClinicMapper {
  static toDomain(e: ClinicTypeOrmEntity): Clinic {
    return new Clinic(
      e.id,
      e.slug,
      e.name,
      e.phone,
      e.email,
      e.address,
      e.timezone,
      e.locale,
      e.is_active,
      e.created_at,
      e.updated_at,
    );
  }

  static toEntity(d: Clinic): Partial<ClinicTypeOrmEntity> {
    return {
      id: d.id,
      slug: d.slug,
      name: d.name,
      phone: d.phone,
      email: d.email,
      address: d.address,
      timezone: d.timezone,
      locale: d.locale,
      is_active: d.isActive,
    };
  }
}
