import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BaseRepository} from "../../../../../lib";
import {
  CreateInsuranceProviderInput,
  IInsuranceProviderRepository,
  UpdateInsuranceProviderInput,
} from "../../../domain/repositories/insurance-provider-repository.interface";
import {InsuranceProvider} from "../../../domain/entities/insurance-provider";
import {InsuranceProviderTypeOrmEntity} from "../entities/insurance-provider.typeorm-entity";
import {InsuranceProviderMapper} from "../mappers/insurance-provider.mapper";

@Injectable()
export class InsuranceProviderRepository
  extends BaseRepository<InsuranceProviderTypeOrmEntity>
  implements IInsuranceProviderRepository
{
  constructor(
    @InjectRepository(InsuranceProviderTypeOrmEntity)
    repo: Repository<InsuranceProviderTypeOrmEntity>,
  ) {
    super(repo);
  }

  // @ts-ignore override return type
  async findById(id: string): Promise<InsuranceProvider | null> {
    const entity = await this.repo.findOne({where: {id}});
    return entity ? InsuranceProviderMapper.toDomain(entity) : null;
  }

  async create(
    provider: CreateInsuranceProviderInput,
  ): Promise<InsuranceProvider> {
    const saved = await this.repo.save({
      clinic_id: provider.clinicId,
      name: provider.name,
      code: provider.code ?? null,
      is_active: provider.isActive ?? true,
    });
    return InsuranceProviderMapper.toDomain(saved);
  }

  async update(
    id: string,
    updates: UpdateInsuranceProviderInput,
  ): Promise<InsuranceProvider> {
    const existing = await this.repo.findOne({where: {id}});
    if (!existing)
      throw new NotFoundException(`Insurance provider \"${id}\" not found`);

    const saved = await this.repo.save({
      ...existing,
      ...(updates.name !== undefined ? {name: updates.name} : {}),
      ...(updates.code !== undefined ? {code: updates.code} : {}),
      ...(updates.isActive !== undefined ? {is_active: updates.isActive} : {}),
    });

    return InsuranceProviderMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findByClinicId(clinicId: string): Promise<InsuranceProvider[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId},
      order: {name: "ASC"},
    });
    return entities.map(InsuranceProviderMapper.toDomain);
  }

  async findActiveByClinicId(clinicId: string): Promise<InsuranceProvider[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId, is_active: true},
      order: {name: "ASC"},
    });
    return entities.map(InsuranceProviderMapper.toDomain);
  }

  async findByName(
    clinicId: string,
    name: string,
  ): Promise<InsuranceProvider | null> {
    const entity = await this.repo.findOne({
      where: {clinic_id: clinicId, name},
    });
    return entity ? InsuranceProviderMapper.toDomain(entity) : null;
  }

  async findByCode(
    clinicId: string,
    code: string,
  ): Promise<InsuranceProvider | null> {
    const entity = await this.repo.findOne({
      where: {clinic_id: clinicId, code},
    });
    return entity ? InsuranceProviderMapper.toDomain(entity) : null;
  }

  async searchByName(
    clinicId: string,
    searchTerm: string,
  ): Promise<InsuranceProvider[]> {
    const entities = await this.repo
      .createQueryBuilder("ip")
      .where("ip.clinic_id = :clinicId", {clinicId})
      .andWhere("ip.name LIKE :search", {search: `%${searchTerm}%`})
      .orderBy("ip.name", "ASC")
      .getMany();
    return entities.map(InsuranceProviderMapper.toDomain);
  }

  async activate(id: string): Promise<InsuranceProvider> {
    return this.update(id, {isActive: true});
  }

  async deactivate(id: string): Promise<InsuranceProvider> {
    return this.update(id, {isActive: false});
  }
}
