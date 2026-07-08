import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import type {FollowUpRequest, MedicalDocumentRequest, Visit, VisitHandoff, VisitStatus} from "../../../domain/entities";
import {
  CloseVisitInput,
  CreateVisitFromQueueInput,
  IVisitWorkflowRepository,
  ListVisitsQuery,
  ListVisitsResult,
  VisitChargeSummary,
} from "../../../domain/repositories/visit-workflow-repository.interface";
import {
  FollowUpRequestTypeOrmEntity,
  MedicalDocumentRequestTypeOrmEntity,
  TreatmentChargeTypeOrmEntity,
  VisitHandoffTypeOrmEntity,
  VisitProcedureTypeOrmEntity,
  VisitTypeOrmEntity,
} from "../entities/treatment.typeorm-entities";
import {TreatmentMapper} from "../mappers/treatment.mapper";

@Injectable()
export class VisitWorkflowRepository implements IVisitWorkflowRepository {
  constructor(
    @InjectRepository(VisitTypeOrmEntity)
    private readonly visits: Repository<VisitTypeOrmEntity>,
    @InjectRepository(VisitHandoffTypeOrmEntity)
    private readonly handoffs: Repository<VisitHandoffTypeOrmEntity>,
    @InjectRepository(VisitProcedureTypeOrmEntity)
    private readonly procedures: Repository<VisitProcedureTypeOrmEntity>,
    @InjectRepository(TreatmentChargeTypeOrmEntity)
    private readonly charges: Repository<TreatmentChargeTypeOrmEntity>,
    @InjectRepository(FollowUpRequestTypeOrmEntity)
    private readonly followUps: Repository<FollowUpRequestTypeOrmEntity>,
    @InjectRepository(MedicalDocumentRequestTypeOrmEntity)
    private readonly documents: Repository<MedicalDocumentRequestTypeOrmEntity>,
  ) {}

  async createVisit(input: CreateVisitFromQueueInput): Promise<Visit> {
    const saved = await this.visits.save({
      clinic_id: input.clinicId,
      patient_id: input.patientId,
      queue_entry_id: input.queueEntryId,
      appointment_id: input.appointmentId ?? null,
      chair_id: input.chairId,
      provider_id: input.providerId,
      status: "OPEN",
      source: "QUEUE",
      started_at: input.startedAt ?? new Date(),
      closed_at: null,
      cancelled_at: null,
      cancellation_reason: null,
    });
    return TreatmentMapper.visit(saved);
  }

  async listVisits(query: ListVisitsQuery): Promise<ListVisitsResult> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 50));
    const handoffVisitIds = query.handoffStatus
      ? await this.findVisitIdsByHandoffStatus(query.clinicId, query.handoffStatus)
      : undefined;

    if (handoffVisitIds && handoffVisitIds.length === 0) {
      return {visits: [], total: 0};
    }

    const qb = this.visits
      .createQueryBuilder("v")
      .where("v.clinic_id = :clinicId", {clinicId: query.clinicId});

    if (query.status) {
      qb.andWhere("v.status = :status", {status: query.status});
    }

    if (handoffVisitIds) {
      qb.andWhere("v.id IN (:...handoffVisitIds)", {handoffVisitIds});
    }

    const [visitEntities, total] = await qb
      .orderBy("v.started_at", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const visitIds = visitEntities.map((visit) => visit.id);
    if (visitIds.length === 0) return {visits: [], total};

    const [handoffEntities, procedureEntities, chargeEntities] =
      await Promise.all([
        this.handoffs.find({
          where: {clinic_id: query.clinicId, visit_id: In(visitIds)},
          order: {saved_at: "DESC"},
        }),
        this.procedures.find({
          where: {clinic_id: query.clinicId, visit_id: In(visitIds)},
          order: {performed_at: "DESC"},
        }),
        this.charges.find({
          where: {clinic_id: query.clinicId, visit_id: In(visitIds)},
          order: {created_at: "DESC"},
        }),
      ]);

    const handoffsByVisit = new Map<string, VisitHandoffTypeOrmEntity[]>();
    handoffEntities.forEach((handoff) => {
      handoffsByVisit.set(handoff.visit_id, [
        ...(handoffsByVisit.get(handoff.visit_id) ?? []),
        handoff,
      ]);
    });

    const proceduresByVisit = new Map<string, VisitProcedureTypeOrmEntity[]>();
    procedureEntities.forEach((procedure) => {
      proceduresByVisit.set(procedure.visit_id, [
        ...(proceduresByVisit.get(procedure.visit_id) ?? []),
        procedure,
      ]);
    });

    const chargesByVisit = new Map<string, TreatmentChargeTypeOrmEntity[]>();
    chargeEntities.forEach((charge) => {
      chargesByVisit.set(charge.visit_id, [
        ...(chargesByVisit.get(charge.visit_id) ?? []),
        charge,
      ]);
    });

    return {
      total,
      visits: visitEntities.map((visit) => ({
        visit: TreatmentMapper.visit(visit),
        latestHandoff: handoffsByVisit.get(visit.id)?.[0]
          ? TreatmentMapper.handoff(handoffsByVisit.get(visit.id)![0])
          : undefined,
        procedures: (proceduresByVisit.get(visit.id) ?? []).map(
          TreatmentMapper.procedure,
        ),
        chargesSummary: this.summarizeCharges(chargesByVisit.get(visit.id) ?? []),
      })),
    };
  }

  private async findVisitIdsByHandoffStatus(
    clinicId: string,
    handoffStatus: string,
  ): Promise<string[]> {
    const rows = await this.handoffs
      .createQueryBuilder("h")
      .select("DISTINCT h.visit_id", "visit_id")
      .where("h.clinic_id = :clinicId", {clinicId})
      .andWhere("h.status = :handoffStatus", {handoffStatus})
      .getRawMany<{visit_id: string}>();

    return rows.map((row) => row.visit_id);
  }

  async findById(id: string): Promise<Visit | null> {
    const entity = await this.visits.findOne({where: {id}});
    return entity ? TreatmentMapper.visit(entity) : null;
  }

  async findActiveByPatient(clinicId: string, patientId: string): Promise<Visit | null> {
    const entity = await this.visits
      .createQueryBuilder("v")
      .where("v.clinic_id = :clinicId", {clinicId})
      .andWhere("v.patient_id = :patientId", {patientId})
      .andWhere("v.status IN (:...statuses)", {statuses: ["OPEN", "NEEDS_CODING"]})
      .orderBy("v.started_at", "DESC")
      .getOne();
    return entity ? TreatmentMapper.visit(entity) : null;
  }

  async findByQueueEntry(clinicId: string, queueEntryId: string): Promise<Visit | null> {
    const entity = await this.visits.findOne({
      where: {clinic_id: clinicId, queue_entry_id: queueEntryId},
    });
    return entity ? TreatmentMapper.visit(entity) : null;
  }

  async updateStatus(visitId: string, status: VisitStatus): Promise<Visit> {
    const entity = await this.visits.findOne({where: {id: visitId}});
    if (!entity) throw new NotFoundException(`Visit "${visitId}" not found`);
    const now = new Date();
    entity.status = status;
    entity.closed_at = status === "CLOSED" ? now : entity.closed_at;
    entity.cancelled_at = status === "CANCELLED" ? now : entity.cancelled_at;
    return TreatmentMapper.visit(await this.visits.save(entity));
  }

  async saveHandoff(handoff: VisitHandoff): Promise<VisitHandoff> {
    const saved = await this.handoffs.save({
      id: handoff.id.startsWith("handoff_") ? undefined : handoff.id,
      clinic_id: handoff.clinicId,
      patient_id: handoff.patientId,
      visit_id: handoff.visitId,
      treatment_plan_item_id: handoff.treatmentPlanItemId ?? null,
      text: handoff.text,
      status: handoff.status,
      authored_by: handoff.authoredBy,
      saved_at: handoff.savedAt,
      coded_at: handoff.codedAt ?? null,
      coded_by: handoff.codedBy ?? null,
    });
    return TreatmentMapper.handoff(saved);
  }

  async markHandoffCoded(handoffId: string, codedBy: string): Promise<VisitHandoff> {
    const entity = await this.handoffs.findOne({where: {id: handoffId}});
    if (!entity) throw new NotFoundException(`Handoff "${handoffId}" not found`);
    entity.status = "CODED";
    entity.coded_by = codedBy;
    entity.coded_at = new Date();
    return TreatmentMapper.handoff(await this.handoffs.save(entity));
  }

  async closeVisit(input: CloseVisitInput): Promise<Visit> {
    const entity = await this.visits.findOne({where: {id: input.visitId}});
    if (!entity) throw new NotFoundException(`Visit "${input.visitId}" not found`);
    if (entity.clinic_id !== input.clinicId || entity.patient_id !== input.patientId) {
      throw new BadRequestException("Visit does not belong to this clinic/patient");
    }
    if (!["OPEN", "NEEDS_CODING"].includes(entity.status)) {
      throw new BadRequestException("Only open visits can be closed");
    }
    entity.status = "CLOSED";
    entity.closed_at = new Date();
    return TreatmentMapper.visit(await this.visits.save(entity));
  }

  async createFollowUpRequest(input: FollowUpRequest): Promise<FollowUpRequest> {
    const saved = await this.followUps.save({
      clinic_id: input.clinicId,
      patient_id: input.patientId,
      visit_id: input.visitId,
      treatment_plan_item_id: input.treatmentPlanItemId ?? null,
      reason: input.reason ?? null,
      preferred_date: input.preferredDate
        ? input.preferredDate.toISOString().slice(0, 10)
        : null,
      urgency: input.urgency,
      status: input.status,
      requested_at: input.requestedAt,
      requested_by: input.requestedBy,
    });
    return TreatmentMapper.followUp(saved);
  }

  async createDocumentRequest(input: MedicalDocumentRequest): Promise<MedicalDocumentRequest> {
    const saved = await this.documents.save({
      clinic_id: input.clinicId,
      patient_id: input.patientId,
      visit_id: input.visitId,
      treatment_plan_item_id: input.treatmentPlanItemId ?? null,
      type: input.type,
      reason: input.reason ?? null,
      status: input.status,
      requested_at: input.requestedAt,
      requested_by: input.requestedBy,
    });
    return TreatmentMapper.documentRequest(saved);
  }

  private summarizeCharges(
    charges: TreatmentChargeTypeOrmEntity[],
  ): VisitChargeSummary {
    if (charges.length === 0) return {total: 0, remaining: 0, status: "NONE"};

    const total = charges.reduce(
      (sum, charge) => sum + Number(charge.original_amount),
      0,
    );
    const remaining = charges.reduce(
      (sum, charge) => sum + Number(charge.remaining_amount),
      0,
    );
    const statuses = [...new Set(charges.map((charge) => charge.status))];
    return {
      total,
      remaining,
      status:
        statuses.length === 1
          ? (statuses[0] as VisitChargeSummary["status"])
          : "MIXED",
    };
  }
}
