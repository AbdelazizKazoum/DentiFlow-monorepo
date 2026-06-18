import {ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {
  ActCatalogListResponse,
  CreateActCatalogInput,
  IActCatalogRepository,
  UpdateActCatalogInput,
} from "../../../domain/repositories/act-catalog-repository.interface";
import {ActCatalog} from "../../../domain/entities/act-catalog";
import {ActCatalogTypeOrmEntity} from "../entities/act-catalog.typeorm-entity";
import {ActCatalogMapper} from "../mappers/act-catalog.mapper";

@Injectable()
export class ActCatalogRepository implements IActCatalogRepository {
  constructor(
    @InjectRepository(ActCatalogTypeOrmEntity)
    private readonly repo: Repository<ActCatalogTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<ActCatalog | null> {
    const entity = await this.repo.findOne({where: {id}});
    return entity ? ActCatalogMapper.toDomain(entity) : null;
  }

  async listByClinic(input: {
    clinicId: string;
    page?: number;
    limit?: number;
  }): Promise<ActCatalogListResponse> {
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.max(1, Math.min(100, input.limit ?? 50));
    const [entities, total] = await this.repo.findAndCount({
      where: {clinic_id: input.clinicId},
      order: {code: "ASC"},
      skip: (page - 1) * limit,
      take: limit,
    });
    return {items: entities.map(ActCatalogMapper.toDomain), total};
  }

  async create(input: CreateActCatalogInput): Promise<ActCatalog> {
    try {
      const saved = await this.repo.save({
        clinic_id: input.clinicId,
        code: input.code,
        name_ar: input.nameAr,
        name_fr: input.nameFr,
        name_en: input.nameEn,
        default_price: input.defaultPrice.toFixed(2),
        is_active: input.isActive ?? true,
      });
      return ActCatalogMapper.toDomain(saved);
    } catch (error) {
      if ((error as {code?: string}).code === "ER_DUP_ENTRY") {
        throw new ConflictException("Act catalog code already exists for clinic");
      }
      throw error;
    }
  }

  async update(id: string, input: UpdateActCatalogInput): Promise<ActCatalog> {
    const existing = await this.repo.findOne({where: {id}});
    if (!existing) throw new NotFoundException(`Act catalog "${id}" not found`);

    try {
      const saved = await this.repo.save({
        ...existing,
        ...(input.code !== undefined ? {code: input.code} : {}),
        ...(input.nameAr !== undefined ? {name_ar: input.nameAr} : {}),
        ...(input.nameFr !== undefined ? {name_fr: input.nameFr} : {}),
        ...(input.nameEn !== undefined ? {name_en: input.nameEn} : {}),
        ...(input.defaultPrice !== undefined
          ? {default_price: input.defaultPrice.toFixed(2)}
          : {}),
        ...(input.isActive !== undefined ? {is_active: input.isActive} : {}),
      });
      return ActCatalogMapper.toDomain(saved);
    } catch (error) {
      if ((error as {code?: string}).code === "ER_DUP_ENTRY") {
        throw new ConflictException("Act catalog code already exists for clinic");
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) {
        throw new NotFoundException(`Act catalog "${id}" not found`);
      }
    } catch (error) {
      if ((error as {code?: string}).code === "ER_ROW_IS_REFERENCED_2") {
        throw new ConflictException("Act catalog is used by treatment acts");
      }
      throw error;
    }
  }
}
