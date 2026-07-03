import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import type {FollowUpRequest, MedicalDocumentRequest, Visit, VisitHandoff, VisitStatus} from "../../../domain/entities";
import {
  CloseVisitInput,
  CreateVisitFromQueueInput,
  IVisitWorkflowRepository,
} from "../../../domain/repositories/visit-workflow-repository.interface";
import {
  FollowUpRequestTypeOrmEntity,
  MedicalDocumentRequestTypeOrmEntity,
  VisitHandoffTypeOrmEntity,
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
}
