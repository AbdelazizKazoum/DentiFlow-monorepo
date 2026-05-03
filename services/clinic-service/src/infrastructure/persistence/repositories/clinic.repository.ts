import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {ClinicTypeOrmEntity} from "../entities/clinic.typeorm-entity";
import {IClinicRepository} from "../../../domain/repositories/clinic-repository.interface";
import {Clinic} from "../../../domain/entities/clinic";
import {ClinicMapper} from "../mappers/clinic.mapper";

// Clinic is the top-level tenant — it has no clinic_id, so it does NOT extend
// BaseRepository (which requires clinic_id for all operations).
@Injectable()
export class ClinicRepository implements IClinicRepository {
  constructor(
    @InjectRepository(ClinicTypeOrmEntity)
    private readonly repo: Repository<ClinicTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Clinic | null> {
    const entity = await this.repo.findOne({where: {id}});
    return entity ? ClinicMapper.toDomain(entity) : null;
  }

  async findBySlug(slug: string): Promise<Clinic | null> {
    const entity = await this.repo.findOne({where: {slug}});
    return entity ? ClinicMapper.toDomain(entity) : null;
  }

  async save(clinic: Clinic): Promise<Clinic> {
    const saved = await this.repo.save(
      ClinicMapper.toEntity(clinic) as ClinicTypeOrmEntity,
    );
    return ClinicMapper.toDomain(saved);
  }
}
