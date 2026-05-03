import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {WorkingHoursTypeOrmEntity} from "../entities/working-hours.typeorm-entity";
import {IWorkingHoursRepository} from "../../../domain/repositories/working-hours-repository.interface";
import {WorkingHours} from "../../../domain/entities/working-hours";
import {WorkingHoursMapper} from "../mappers/working-hours.mapper";

@Injectable()
export class WorkingHoursRepository implements IWorkingHoursRepository {
  constructor(
    @InjectRepository(WorkingHoursTypeOrmEntity)
    private readonly repo: Repository<WorkingHoursTypeOrmEntity>,
  ) {}

  async findByClinic(clinicId: string): Promise<WorkingHours[]> {
    const entities = await this.repo.find({
      where: {clinic_id: clinicId},
      order: {day_of_week: "ASC"},
    });
    return entities.map(WorkingHoursMapper.toDomain);
  }

  async upsertEntries(entries: WorkingHours[]): Promise<WorkingHours[]> {
    await this.repo.upsert(
      entries.map(
        (e) => WorkingHoursMapper.toEntity(e) as WorkingHoursTypeOrmEntity,
      ),
      {
        conflictPaths: ["clinic_id", "day_of_week"],
        skipUpdateIfNoValuesChanged: true,
      },
    );
    return this.findByClinic(entries[0]!.clinicId);
  }
}
