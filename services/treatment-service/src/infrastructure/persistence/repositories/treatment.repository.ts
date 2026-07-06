import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {IsNull, Repository} from "typeorm";
import type {
  ClinicalAttachment,
  Diagnosis,
  TreatmentAct,
  TreatmentCharge,
  TreatmentGroup,
  TreatmentPlanItem,
  VisitProcedure,
} from "../../../domain/entities";
import {
  GetTreatmentWorkspaceQuery,
  ITreatmentRepository,
  TreatmentWorkspace,
} from "../../../domain/repositories/treatment-repository.interface";
import {
  ClinicalAttachmentTypeOrmEntity,
  DiagnosisTypeOrmEntity,
  FollowUpRequestTypeOrmEntity,
  MedicalDocumentRequestTypeOrmEntity,
  TreatmentActTypeOrmEntity,
  TreatmentChargeTypeOrmEntity,
  TreatmentGroupTypeOrmEntity,
  TreatmentPlanItemTypeOrmEntity,
  VisitHandoffTypeOrmEntity,
  VisitProcedureTypeOrmEntity,
  VisitTypeOrmEntity,
} from "../entities/treatment.typeorm-entities";
import {TreatmentMapper} from "../mappers/treatment.mapper";

@Injectable()
export class TreatmentRepository implements ITreatmentRepository {
  constructor(
    @InjectRepository(TreatmentActTypeOrmEntity)
    private readonly acts: Repository<TreatmentActTypeOrmEntity>,
    @InjectRepository(VisitTypeOrmEntity)
    private readonly visits: Repository<VisitTypeOrmEntity>,
    @InjectRepository(TreatmentGroupTypeOrmEntity)
    private readonly groups: Repository<TreatmentGroupTypeOrmEntity>,
    @InjectRepository(TreatmentPlanItemTypeOrmEntity)
    private readonly planItems: Repository<TreatmentPlanItemTypeOrmEntity>,
    @InjectRepository(VisitProcedureTypeOrmEntity)
    private readonly procedures: Repository<VisitProcedureTypeOrmEntity>,
    @InjectRepository(DiagnosisTypeOrmEntity)
    private readonly diagnoses: Repository<DiagnosisTypeOrmEntity>,
    @InjectRepository(ClinicalAttachmentTypeOrmEntity)
    private readonly attachments: Repository<ClinicalAttachmentTypeOrmEntity>,
    @InjectRepository(VisitHandoffTypeOrmEntity)
    private readonly handoffs: Repository<VisitHandoffTypeOrmEntity>,
    @InjectRepository(TreatmentChargeTypeOrmEntity)
    private readonly charges: Repository<TreatmentChargeTypeOrmEntity>,
    @InjectRepository(FollowUpRequestTypeOrmEntity)
    private readonly followUps: Repository<FollowUpRequestTypeOrmEntity>,
    @InjectRepository(MedicalDocumentRequestTypeOrmEntity)
    private readonly documents: Repository<MedicalDocumentRequestTypeOrmEntity>,
  ) {}

  async getWorkspace(query: GetTreatmentWorkspaceQuery): Promise<TreatmentWorkspace> {
    const activeVisit = query.activeVisitId
      ? await this.visits.findOne({
          where: {
            id: query.activeVisitId,
            clinic_id: query.clinicId,
            patient_id: query.patientId,
          },
        })
      : await this.visits
          .createQueryBuilder("v")
          .where("v.clinic_id = :clinicId", {clinicId: query.clinicId})
          .andWhere("v.patient_id = :patientId", {patientId: query.patientId})
          .andWhere("v.status IN (:...statuses)", {statuses: ["OPEN", "NEEDS_CODING"]})
          .orderBy("v.started_at", "DESC")
          .getOne();

    const [
      acts,
      treatmentPlan,
      currentSession,
      diagnoses,
      attachments,
      charges,
      handoffs,
      followUpRequests,
      documentRequests,
    ] = await Promise.all([
      this.acts.find({
        where: [{clinic_id: query.clinicId, active: true}, {clinic_id: IsNull(), active: true}],
        order: {category: "ASC", name: "ASC"},
      }),
      this.planItems.find({
        where: {clinic_id: query.clinicId, patient_id: query.patientId},
        order: {created_at: "DESC"},
      }),
      this.procedures.find({
        where: {
          clinic_id: query.clinicId,
          patient_id: query.patientId,
          ...(activeVisit ? {visit_id: activeVisit.id} : {}),
        },
        order: {performed_at: "DESC"},
      }),
      this.diagnoses.find({
        where: {clinic_id: query.clinicId, patient_id: query.patientId},
        order: {created_at: "DESC"},
      }),
      this.attachments.find({
        where: {clinic_id: query.clinicId, patient_id: query.patientId},
        order: {uploaded_at: "DESC"},
      }),
      this.charges.find({
        where: {clinic_id: query.clinicId, patient_id: query.patientId},
        order: {created_at: "DESC"},
      }),
      this.handoffs.find({
        where: {clinic_id: query.clinicId, patient_id: query.patientId},
        order: {saved_at: "DESC"},
      }),
      this.followUps.find({
        where: {clinic_id: query.clinicId, patient_id: query.patientId},
        order: {requested_at: "DESC"},
      }),
      this.documents.find({
        where: {clinic_id: query.clinicId, patient_id: query.patientId},
        order: {requested_at: "DESC"},
      }),
    ]);

    return {
      activeVisit: activeVisit ? TreatmentMapper.visit(activeVisit) : undefined,
      acts: acts.map(TreatmentMapper.act),
      treatmentPlan: treatmentPlan.map(TreatmentMapper.planItem),
      currentSession: currentSession.map(TreatmentMapper.procedure),
      diagnoses: diagnoses.map(TreatmentMapper.diagnosis),
      attachments: attachments.map(TreatmentMapper.attachment),
      charges: charges.map(TreatmentMapper.charge),
      handoffs: handoffs.map(TreatmentMapper.handoff),
      followUpRequests: followUpRequests.map(TreatmentMapper.followUp),
      documentRequests: documentRequests.map(TreatmentMapper.documentRequest),
    };
  }

  async getAct(id: string, clinicId: string): Promise<TreatmentAct | null> {
    const entity = await this.acts.findOne({
      where: [
        {id, clinic_id: clinicId, active: true},
        {id, clinic_id: IsNull(), active: true},
      ],
    });
    return entity ? TreatmentMapper.act(entity) : null;
  }

  async getTreatmentPlanItem(id: string): Promise<TreatmentPlanItem | null> {
    const entity = await this.planItems.findOne({where: {id}});
    return entity ? TreatmentMapper.planItem(entity) : null;
  }

  async saveTreatmentPlanItems(items: TreatmentPlanItem[]): Promise<TreatmentPlanItem[]> {
    const saved = await this.planItems.save(items.map((item) => this.planEntity(item)));
    return saved.map(TreatmentMapper.planItem);
  }

  async updateTreatmentPlanItem(id: string, patch: Partial<TreatmentPlanItem>): Promise<TreatmentPlanItem> {
    const current = await this.planItems.findOne({where: {id}});
    if (!current) throw new NotFoundException(`Treatment plan item "${id}" not found`);
    const merged = {...TreatmentMapper.planItem(current), ...patch, id};
    return TreatmentMapper.planItem(await this.planItems.save(this.planEntity(merged)));
  }

  async saveTreatmentGroup(group: TreatmentGroup): Promise<TreatmentGroup> {
    const saved = await this.groups.save({
      id: group.id.startsWith("group_") ? undefined : group.id,
      clinic_id: group.clinicId,
      patient_id: group.patientId,
      act_id: group.actId,
      act_name: group.actName,
      tooth_ids: group.toothIds,
      billing_mode: group.billingMode,
      created_at: group.createdAt,
      created_by: group.createdBy,
    });
    return TreatmentMapper.group(saved);
  }

  async saveVisitProcedure(procedure: VisitProcedure): Promise<VisitProcedure> {
    const saved = await this.procedures.save({
      id: procedure.id.startsWith("vp_") ? undefined : procedure.id,
      clinic_id: procedure.clinicId,
      patient_id: procedure.patientId,
      visit_id: procedure.visitId,
      treatment_plan_item_id: procedure.treatmentPlanItemId,
      act_id: procedure.actId,
      act_name: procedure.actName,
      location: procedure.location as unknown as Record<string, unknown>,
      status: procedure.status,
      action: procedure.action,
      notes: procedure.notes ?? null,
      performed_at: procedure.performedAt,
      completed_at: procedure.completedAt ?? null,
      provider_id: procedure.providerId,
    } as Partial<VisitProcedureTypeOrmEntity>);
    return TreatmentMapper.procedure(saved as VisitProcedureTypeOrmEntity);
  }

  async getVisitProcedure(id: string): Promise<VisitProcedure | null> {
    const entity = await this.procedures.findOne({where: {id}});
    return entity ? TreatmentMapper.procedure(entity) : null;
  }

  async updateVisitProcedure(id: string, patch: Partial<VisitProcedure>): Promise<VisitProcedure> {
    const current = await this.procedures.findOne({where: {id}});
    if (!current) throw new NotFoundException(`Visit procedure "${id}" not found`);
    const merged = {...TreatmentMapper.procedure(current), ...patch, id};
    return this.saveVisitProcedure(merged);
  }

  async saveDiagnosis(diagnosis: Diagnosis): Promise<Diagnosis> {
    const saved = await this.diagnoses.save({
      id: diagnosis.id.startsWith("d_") ? undefined : diagnosis.id,
      clinic_id: diagnosis.clinicId,
      patient_id: diagnosis.patientId,
      diagnosis: diagnosis.diagnosis,
      location: diagnosis.location as unknown as Record<string, unknown>,
      severity: diagnosis.severity,
      certainty: diagnosis.certainty,
      status: diagnosis.status,
      evidence: diagnosis.evidence,
      attachment_ids: diagnosis.attachmentIds,
      symptoms: diagnosis.symptoms,
      pain_level: diagnosis.painLevel,
      notes: diagnosis.notes ?? null,
      created_at: diagnosis.createdAt,
      created_by: diagnosis.createdBy,
    } as Partial<DiagnosisTypeOrmEntity>);
    return TreatmentMapper.diagnosis(saved as DiagnosisTypeOrmEntity);
  }

  async saveClinicalAttachments(items: ClinicalAttachment[]): Promise<ClinicalAttachment[]> {
    const saved = await this.attachments.save(
      items.map((attachment) => ({
        id: attachment.id.startsWith("attachment_") ? undefined : attachment.id,
        clinic_id: attachment.clinicId,
        patient_id: attachment.patientId,
        visit_id: attachment.visitId ?? null,
        type: attachment.type,
        title: attachment.title,
        file_name: attachment.fileName,
        mime_type: attachment.mimeType,
        file_url: attachment.fileUrl,
        uploaded_at: attachment.uploadedAt,
        uploaded_by: attachment.uploadedBy,
      })),
    );
    return saved.map(TreatmentMapper.attachment);
  }

  async saveTreatmentCharge(charge: TreatmentCharge): Promise<TreatmentCharge> {
    const saved = await this.charges.save({
      id: charge.id.startsWith("charge_") ? undefined : charge.id,
      clinic_id: charge.clinicId,
      patient_id: charge.patientId,
      visit_id: charge.visitId,
      source_type: charge.sourceType,
      source_id: charge.sourceId,
      label: charge.label,
      location_label: charge.locationLabel,
      original_amount: String(charge.originalAmount),
      paid_amount: String(charge.paidAmount),
      remaining_amount: String(charge.remainingAmount),
      status: charge.status,
      created_at: charge.createdAt,
      created_by: charge.createdBy,
    });
    return TreatmentMapper.charge(saved);
  }

  private planEntity(item: TreatmentPlanItem): Partial<TreatmentPlanItemTypeOrmEntity> {
    return {
      id: item.id.startsWith("act_") ? undefined : item.id,
      clinic_id: item.clinicId,
      patient_id: item.patientId,
      act_id: item.actId,
      act_name: item.actName,
      price: String(item.price),
      priority: item.priority,
      status: item.status,
      location: item.location as unknown as Record<string, unknown>,
      notes: item.notes ?? null,
      treatment_group_id: item.treatmentGroupId ?? null,
      visit_procedure_ids: item.visitProcedureIds,
      charge_id: item.chargeId ?? null,
      billing_status: item.billingStatus,
      created_at: item.createdAt,
      created_by: item.createdBy,
      started_at: item.startedAt ?? null,
      completed_at: item.completedAt ?? null,
      cancelled_at: item.cancelledAt ?? null,
      cancellation_reason: item.cancellationReason ?? null,
      voided_at: item.voidedAt ?? null,
      void_reason: item.voidReason ?? null,
      status_changed_at: item.statusChangedAt ?? null,
      status_changed_by: item.statusChangedBy ?? null,
    };
  }
}
