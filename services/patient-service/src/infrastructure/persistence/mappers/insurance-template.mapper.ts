import {InsuranceTemplate} from "../../../domain/entities/insurance-template";
import {InsuranceTemplateTypeOrmEntity} from "../entities/insurance-template.typeorm-entity";

export class InsuranceTemplateMapper {
  static toDomain(e: InsuranceTemplateTypeOrmEntity): InsuranceTemplate {
    return new InsuranceTemplate(
      e.id,
      e.insurance_provider_id,
      e.name,
      e.file_url,
      e.created_at,
    );
  }

  static toEntity(
    d: InsuranceTemplate,
  ): Partial<InsuranceTemplateTypeOrmEntity> {
    return {
      ...(d.id ? {id: d.id} : {}),
      insurance_provider_id: d.insuranceProviderId,
      name: d.name,
      file_url: d.fileUrl,
    };
  }
}
