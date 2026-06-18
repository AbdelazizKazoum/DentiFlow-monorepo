import type {ActCatalog} from "@/domain/treatment/entities/ActCatalog";
import type {
  ActCatalogDTO,
  CreateActCatalogDTO,
  UpdateActCatalogDTO,
} from "../dtos/actCatalog.dto";

export const actCatalogToDomain = (dto: ActCatalogDTO): ActCatalog => ({
  id: dto.id,
  clinicId: dto.clinic_id,
  code: dto.code,
  nameAr: dto.name_ar,
  nameFr: dto.name_fr,
  nameEn: dto.name_en,
  defaultPrice: dto.default_price,
  isActive: dto.is_active,
  icon: dto.icon ?? undefined,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const actCatalogToCreateDTO = (
  catalog: Partial<ActCatalog>,
): CreateActCatalogDTO => ({
  clinic_id: catalog.clinicId ?? "",
  code: catalog.code ?? "",
  name_ar: catalog.nameAr ?? catalog.nameEn ?? "",
  name_fr: catalog.nameFr ?? catalog.nameEn ?? "",
  name_en: catalog.nameEn ?? "",
  default_price: catalog.defaultPrice ?? 0,
  ...(catalog.isActive !== undefined ? {is_active: catalog.isActive} : {}),
  ...(catalog.icon !== undefined ? {icon: catalog.icon} : {}),
});

export const actCatalogToUpdateDTO = (
  catalog: Partial<ActCatalog>,
): UpdateActCatalogDTO => ({
  ...(catalog.code !== undefined ? {code: catalog.code} : {}),
  ...(catalog.nameAr !== undefined ? {name_ar: catalog.nameAr} : {}),
  ...(catalog.nameFr !== undefined ? {name_fr: catalog.nameFr} : {}),
  ...(catalog.nameEn !== undefined ? {name_en: catalog.nameEn} : {}),
  ...(catalog.defaultPrice !== undefined
    ? {default_price: catalog.defaultPrice}
    : {}),
  ...(catalog.isActive !== undefined ? {is_active: catalog.isActive} : {}),
  ...(catalog.icon !== undefined ? {icon: catalog.icon ?? null} : {}),
});
