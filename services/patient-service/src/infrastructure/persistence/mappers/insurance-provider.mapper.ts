import {InsuranceProvider} from "../../../domain/entities/insurance-provider";
import {InsuranceProviderTypeOrmEntity} from "../entities/insurance-provider.typeorm-entity";

export class InsuranceProviderMapper {
  static toDomain(e: InsuranceProviderTypeOrmEntity): InsuranceProvider {
    return new InsuranceProvider(
      e.id,
      e.clinic_id,
      e.name,
      e.code,
      e.is_active,
      e.created_at,
      e.updated_at,
    );
  }

  static toEntity(
    d: InsuranceProvider,
  ): Partial<InsuranceProviderTypeOrmEntity> {
    return {
      ...(d.id ? {id: d.id} : {}),
      clinic_id: d.clinicId,
      name: d.name,
      code: d.code,
      is_active: d.isActive,
    };
  }
}
