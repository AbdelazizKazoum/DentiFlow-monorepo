import {ActCatalog} from "../../../domain/entities/act-catalog";
import {ActCatalogTypeOrmEntity} from "../entities/act-catalog.typeorm-entity";

export class ActCatalogMapper {
  static toDomain(entity: ActCatalogTypeOrmEntity): ActCatalog {
    return new ActCatalog(
      entity.id,
      entity.clinic_id,
      entity.code,
      entity.name_ar,
      entity.name_fr,
      entity.name_en,
      Number(entity.default_price),
      entity.is_active,
      entity.icon,
      entity.created_at,
      entity.updated_at,
    );
  }
}
