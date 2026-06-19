import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {TreatmentAct} from "../../../domain/entities/treatment-act";
import {TreatmentActStatus} from "../../../domain/enums/treatment-act-status.enum";
import {
  AddTreatmentActInput,
  ITreatmentActRepository,
  UpdateTreatmentActInput,
} from "../../../domain/repositories/treatment-act-repository.interface";
import {TreatmentActTypeOrmEntity} from "../entities/treatment-act.typeorm-entity";
import {TreatmentActMapper} from "../mappers/treatment-act.mapper";

@Injectable()
export class TreatmentActRepository implements ITreatmentActRepository {
  constructor(
    @InjectRepository(TreatmentActTypeOrmEntity)
    private readonly repo: Repository<TreatmentActTypeOrmEntity>,
  ) {}

  async findById(id: string): Promise<TreatmentAct | null> {
    const entity = await this.repo.findOne({where: {id}});
    return entity ? TreatmentActMapper.toDomain(entity) : null;
  }

  async listByVisit(visitId: string): Promise<TreatmentAct[]> {
    const entities = await this.repo.find({
      where: {visit_id: visitId},
      order: {created_at: "ASC"},
    });
    return entities.map(TreatmentActMapper.toDomain);
  }

  async create(input: AddTreatmentActInput): Promise<TreatmentAct> {
    this.assertQuantity(input.quantity ?? 1);
    const saved = await this.repo.save({
      clinic_id: input.clinicId,
      visit_id: input.visitId,
      treatment_plan_item_id: input.treatmentPlanItemId ?? null,
      act_catalog_id: input.actCatalogId,
      tooth_fdi: input.toothFdi ?? null,
      quantity: input.quantity ?? 1,
      unit_price: input.unitPrice.toFixed(2),
      surface: input.surface ?? null,
      tooth_part: input.toothPart ?? null,
      dentition: input.dentition ?? null,
      status: input.status ?? TreatmentActStatus.PLANNED,
      action_type: input.actionType,
      notes: input.notes ?? null,
      entered_by: input.enteredBy,
    });
    return TreatmentActMapper.toDomain(saved);
  }

  async update(id: string, input: UpdateTreatmentActInput): Promise<TreatmentAct> {
    const existing = await this.repo.findOne({where: {id}});
    if (!existing) throw new NotFoundException(`Treatment act "${id}" not found`);
    if (input.quantity !== undefined) this.assertQuantity(input.quantity);

    const saved = await this.repo.save({
      ...existing,
      ...(input.toothFdi !== undefined ? {tooth_fdi: input.toothFdi} : {}),
      ...(input.quantity !== undefined ? {quantity: input.quantity} : {}),
      ...(input.surface !== undefined ? {surface: input.surface} : {}),
      ...(input.toothPart !== undefined ? {tooth_part: input.toothPart} : {}),
      ...(input.dentition !== undefined ? {dentition: input.dentition} : {}),
      ...(input.status !== undefined ? {status: input.status} : {}),
      ...(input.actionType !== undefined ? {action_type: input.actionType} : {}),
      ...(input.notes !== undefined ? {notes: input.notes} : {}),
    });
    return TreatmentActMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException(`Treatment act "${id}" not found`);
  }

  countByVisit(visitId: string): Promise<number> {
    return this.repo.count({where: {visit_id: visitId}});
  }

  async hasDoneAct(visitId: string): Promise<boolean> {
    return (
      (await this.repo.count({
        where: {visit_id: visitId, status: TreatmentActStatus.DONE},
      })) > 0
    );
  }

  async calculateTotal(visitId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder("act")
      .select("COALESCE(SUM(act.quantity * act.unit_price), 0)", "total")
      .where("act.visit_id = :visitId", {visitId})
      .andWhere("act.status != :cancelled", {
        cancelled: TreatmentActStatus.CANCELLED,
      })
      .getRawOne<{total: string | number}>();
    return Number(result?.total ?? 0);
  }

  private assertQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException("Treatment act quantity must be at least 1");
    }
  }
}
