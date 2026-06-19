import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Not, Repository} from "typeorm";
import {TreatmentActStatus} from "../../../domain/enums/treatment-act-status.enum";
import {CreateTreatmentPlanInput, ITreatmentPlanRepository} from "../../../domain/repositories/treatment-plan-repository.interface";
import {TreatmentPlanItem} from "../../../domain/entities/treatment-plan-item";
import {TreatmentPlanItemTypeOrmEntity} from "../entities/treatment-plan-item.typeorm-entity";
import {TreatmentPlanItemMapper} from "../mappers/treatment-plan-item.mapper";

@Injectable()
export class TreatmentPlanRepository implements ITreatmentPlanRepository {
  constructor(@InjectRepository(TreatmentPlanItemTypeOrmEntity) private readonly repo: Repository<TreatmentPlanItemTypeOrmEntity>) {}
  async findById(id: string): Promise<TreatmentPlanItem | null> { const e = await this.repo.findOne({where: {id}}); return e ? TreatmentPlanItemMapper.toDomain(e) : null; }
  async listByPatient(clinicId: string, patientId: string, includeCancelled = false): Promise<TreatmentPlanItem[]> {
    const where = includeCancelled ? {clinic_id: clinicId, patient_id: patientId} : {clinic_id: clinicId, patient_id: patientId, status: Not(TreatmentActStatus.CANCELLED)};
    return (await this.repo.find({where, order: {updated_at: "DESC"}})).map(TreatmentPlanItemMapper.toDomain);
  }
  async create(input: CreateTreatmentPlanInput): Promise<TreatmentPlanItem> {
    return TreatmentPlanItemMapper.toDomain(await this.repo.save({clinic_id: input.clinicId, patient_id: input.patientId, act_catalog_id: input.actCatalogId, tooth_fdi: input.toothFdi ?? null, surface: input.surface ?? null, tooth_part: input.toothPart ?? null, dentition: input.dentition ?? null, diagnosis_notes: input.diagnosisNotes ?? null, created_visit_id: input.createdVisitId, created_by: input.createdBy}));
  }
  async updateStatus(id: string, status: TreatmentActStatus, completedVisitId: string | null = null, completedBy: string | null = null): Promise<TreatmentPlanItem> {
    const e = await this.repo.findOne({where: {id}}); if (!e) throw new NotFoundException(`Treatment plan item "${id}" not found`);
    e.status = status; if (status === TreatmentActStatus.DONE) { e.completed_visit_id = completedVisitId; e.completed_by = completedBy; } return TreatmentPlanItemMapper.toDomain(await this.repo.save(e));
  }
}
