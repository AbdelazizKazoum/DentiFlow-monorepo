import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {
  CreateInsuranceTemplateInput,
  IInsuranceTemplateRepository,
  UpdateInsuranceTemplateInput,
} from "../../../domain/repositories/insurance-template-repository.interface";
import {InsuranceTemplate} from "../../../domain/entities/insurance-template";
import {InsuranceTemplateTypeOrmEntity} from "../entities/insurance-template.typeorm-entity";
import {InsuranceTemplateMapper} from "../mappers/insurance-template.mapper";

@Injectable()
export class InsuranceTemplateRepository implements IInsuranceTemplateRepository {
  constructor(
    @InjectRepository(InsuranceTemplateTypeOrmEntity)
    private readonly repo: Repository<InsuranceTemplateTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<InsuranceTemplate | null> {
    const entity = await this.repo.findOne({where: {id}});
    return entity ? InsuranceTemplateMapper.toDomain(entity) : null;
  }

  async create(
    template: CreateInsuranceTemplateInput,
  ): Promise<InsuranceTemplate> {
    const saved = await this.repo.save({
      insurance_provider_id: template.insuranceProviderId,
      name: template.name,
      file_url: template.fileUrl,
    });
    return InsuranceTemplateMapper.toDomain(saved);
  }

  async update(
    id: string,
    updates: UpdateInsuranceTemplateInput,
  ): Promise<InsuranceTemplate> {
    const existing = await this.repo.findOne({where: {id}});
    if (!existing)
      throw new NotFoundException(`Insurance template \"${id}\" not found`);

    const saved = await this.repo.save({
      ...existing,
      ...(updates.name !== undefined ? {name: updates.name} : {}),
      ...(updates.fileUrl !== undefined ? {file_url: updates.fileUrl} : {}),
    });

    return InsuranceTemplateMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findByProviderId(providerId: string): Promise<InsuranceTemplate[]> {
    const entities = await this.repo.find({
      where: {insurance_provider_id: providerId},
      order: {created_at: "DESC"},
    });
    return entities.map(InsuranceTemplateMapper.toDomain);
  }

  async findByProviderIds(providerIds: string[]): Promise<InsuranceTemplate[]> {
    if (!providerIds.length) return [];
    const entities = await this.repo.find({
      where: {insurance_provider_id: In(providerIds)},
      order: {created_at: "DESC"},
    });
    return entities.map(InsuranceTemplateMapper.toDomain);
  }

  async findByName(
    providerId: string,
    name: string,
  ): Promise<InsuranceTemplate | null> {
    const entity = await this.repo.findOne({
      where: {insurance_provider_id: providerId, name},
    });
    return entity ? InsuranceTemplateMapper.toDomain(entity) : null;
  }

  async searchByName(searchTerm: string): Promise<InsuranceTemplate[]> {
    const entities = await this.repo
      .createQueryBuilder("it")
      .where("it.name LIKE :search", {search: `%${searchTerm}%`})
      .orderBy("it.created_at", "DESC")
      .getMany();
    return entities.map(InsuranceTemplateMapper.toDomain);
  }

  async findAll(): Promise<InsuranceTemplate[]> {
    const entities = await this.repo.find({order: {created_at: "DESC"}});
    return entities.map(InsuranceTemplateMapper.toDomain);
  }
}
