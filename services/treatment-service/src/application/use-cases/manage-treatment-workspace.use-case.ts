import {BadRequestException, Inject, Injectable, NotFoundException} from "@nestjs/common";
import {randomUUID} from "crypto";
import type {
  ClinicalAttachment,
  Diagnosis,
  SurfaceCode,
  TreatmentCharge,
  TreatmentLocation,
  TreatmentPlanItem,
  VisitProcedure,
} from "../../domain/entities";
import {
  GetTreatmentWorkspaceQuery,
  ITreatmentRepository,
  TreatmentWorkspace,
} from "../../domain/repositories/treatment-repository.interface";
import {TREATMENT_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManageTreatmentWorkspaceUseCase {
  constructor(
    @Inject(TREATMENT_REPOSITORY)
    private readonly repository: ITreatmentRepository,
  ) {}

  getWorkspace(query: GetTreatmentWorkspaceQuery): Promise<TreatmentWorkspace> {
    return this.repository.getWorkspace(query);
  }

  async createTreatmentPlanItems(input: {
    clinicId: string;
    patientId: string;
    actId: string;
    selectedTeeth: number[];
    mouthRegionId?: string;
    surfacesByTooth: Record<number, SurfaceCode[]>;
    priority: TreatmentPlanItem["priority"];
    notes?: string;
    dentition: TreatmentLocation["dentition"];
    providerId: string;
  }): Promise<{items: TreatmentPlanItem[]}> {
    const act = await this.repository.getAct(input.actId, input.clinicId);
    if (!act) throw new NotFoundException(`Treatment act "${input.actId}" not found`);
    const now = new Date();
    const hasRegionTarget = Boolean(input.mouthRegionId) || input.selectedTeeth.length === 0;
    const shouldGroup =
      !hasRegionTarget && input.selectedTeeth.length > 1 && act.groupableTeeth;
    const groupId = shouldGroup ? randomUUID() : undefined;
    const base = {
      clinicId: input.clinicId,
      patientId: input.patientId,
      actId: act.id,
      actName: act.name,
      price: act.price,
      priority: input.priority,
      status: "PROPOSED" as const,
      notes: input.notes?.trim() || undefined,
      treatmentGroupId: groupId,
      visitProcedureIds: [],
      billingStatus: "NOT_CHARGED" as const,
      createdAt: now,
      createdBy: input.providerId,
    };

    const targets = hasRegionTarget || shouldGroup ? [undefined] : input.selectedTeeth;
    const items = targets.map((tooth) => ({
      ...base,
      id: randomUUID(),
      treatmentGroupId: shouldGroup ? groupId : undefined,
      location: this.location({...input, selectedTeeth: tooth ? [tooth] : input.selectedTeeth}),
    }));

    if (shouldGroup && groupId) {
      await this.repository.saveTreatmentGroup({
        id: groupId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        actId: act.id,
        actName: act.name,
        toothIds: input.selectedTeeth,
        billingMode: "PACKAGE",
        createdAt: now,
        createdBy: input.providerId,
      });
    }

    return {items: await this.repository.saveTreatmentPlanItems(items)};
  }

  async createDiagnosis(input: {
    clinicId: string;
    patientId: string;
    diagnosis: string;
    selectedTeeth: number[];
    mouthRegionId?: string;
    surfacesByTooth: Record<number, SurfaceCode[]>;
    severity: Diagnosis["severity"];
    certainty: Diagnosis["certainty"];
    status: Diagnosis["status"];
    evidence: Diagnosis["evidence"];
    attachmentIds: string[];
    symptoms: string[];
    painLevel: number;
    notes?: string;
    dentition: TreatmentLocation["dentition"];
    providerId: string;
  }): Promise<Diagnosis> {
    return this.repository.saveDiagnosis({
      id: randomUUID(),
      clinicId: input.clinicId,
      patientId: input.patientId,
      diagnosis: input.diagnosis,
      location: this.location(input),
      severity: input.severity,
      certainty: input.certainty,
      status: input.status,
      evidence: input.evidence,
      attachmentIds: input.attachmentIds,
      symptoms: input.symptoms,
      painLevel: input.painLevel,
      notes: input.notes?.trim() || undefined,
      createdAt: new Date(),
      createdBy: input.providerId,
    });
  }

  async startTreatment(input: {
    clinicId: string;
    patientId: string;
    visitId: string;
    treatmentPlanItemId: string;
    providerId: string;
  }): Promise<{treatmentItem: TreatmentPlanItem; procedure: VisitProcedure; charge?: TreatmentCharge; reusedExistingProcedure: boolean}> {
    const [workspace, item] = await Promise.all([
      this.repository.getWorkspace({
        clinicId: input.clinicId,
        patientId: input.patientId,
        activeVisitId: input.visitId,
      }),
      this.repository.getTreatmentPlanItem(input.treatmentPlanItemId),
    ]);
    if (!item) throw new NotFoundException(`Treatment plan item "${input.treatmentPlanItemId}" not found`);
    if (item.clinicId !== input.clinicId || item.patientId !== input.patientId) {
      throw new BadRequestException("Treatment item does not belong to this clinic/patient");
    }

    const existing = workspace.currentSession.find(
      (procedure) =>
        procedure.visitId === input.visitId &&
        procedure.treatmentPlanItemId === item.id &&
        procedure.status !== "COMPLETED",
    );
    if (existing) {
      return {treatmentItem: item, procedure: existing, reusedExistingProcedure: true};
    }

    const now = new Date();
    const shouldCharge =
      item.price > 0 &&
      !item.chargeId &&
      !workspace.charges.some(
        (charge) => charge.sourceType === "TREATMENT_PLAN_ITEM" && charge.sourceId === item.id,
      );
    const chargeId = shouldCharge ? randomUUID() : item.chargeId;
    const treatmentItem = await this.repository.updateTreatmentPlanItem(item.id, {
      status: "IN_PROGRESS",
      startedAt: item.startedAt ?? now,
      billingStatus: chargeId ? "CHARGED" : item.billingStatus,
      chargeId,
    });
    const procedure = await this.repository.saveVisitProcedure({
      id: randomUUID(),
      clinicId: input.clinicId,
      patientId: input.patientId,
      visitId: input.visitId,
      treatmentPlanItemId: item.id,
      actId: item.actId,
      actName: item.actName,
      location: item.location,
      status: "IN_PROGRESS",
      action: item.status === "IN_PROGRESS" ? "CONTINUED" : "STARTED",
      notes: item.notes,
      performedAt: now,
      providerId: input.providerId,
    });
    const charge = shouldCharge
      ? await this.repository.saveTreatmentCharge({
          id: chargeId!,
          clinicId: input.clinicId,
          patientId: input.patientId,
          visitId: input.visitId,
          sourceType: "TREATMENT_PLAN_ITEM",
          sourceId: item.id,
          label: item.actName,
          locationLabel: item.location.label,
          originalAmount: item.price,
          paidAmount: 0,
          remainingAmount: item.price,
          status: "UNPAID",
          createdAt: now,
          createdBy: input.providerId,
        })
      : undefined;
    return {treatmentItem, procedure, charge, reusedExistingProcedure: false};
  }

  async completeVisitProcedure(input: {
    clinicId: string;
    patientId?: string;
    visitProcedureId: string;
    providerId: string;
  }): Promise<{procedure: VisitProcedure; treatmentItem?: TreatmentPlanItem}> {
    const procedure = await this.repository.getVisitProcedure(input.visitProcedureId);
    if (!procedure) throw new NotFoundException(`Visit procedure "${input.visitProcedureId}" not found`);
    if (procedure.clinicId !== input.clinicId) {
      throw new BadRequestException("Procedure does not belong to this clinic");
    }
    const now = new Date();
    const updatedProcedure = await this.repository.updateVisitProcedure(procedure.id, {
      status: "COMPLETED",
      action: "COMPLETED",
      completedAt: now,
      providerId: input.providerId,
    });
    const item = await this.repository.getTreatmentPlanItem(procedure.treatmentPlanItemId);
    const treatmentItem = item
      ? await this.repository.updateTreatmentPlanItem(item.id, {
          visitProcedureIds: item.visitProcedureIds.includes(procedure.id)
            ? item.visitProcedureIds
            : [...item.visitProcedureIds, procedure.id],
          status: "COMPLETED",
          completedAt: now,
        })
      : undefined;
    return {procedure: updatedProcedure, treatmentItem};
  }

  async changeTreatmentStatus(input: {
    clinicId: string;
    treatmentPlanItemId: string;
    status: Extract<TreatmentPlanItem["status"], "CANCELLED" | "VOIDED" | "DECLINED">;
    reason: string;
    providerId: string;
  }): Promise<TreatmentPlanItem> {
    if (!input.reason.trim()) throw new BadRequestException("A reason is required");
    const item = await this.repository.getTreatmentPlanItem(input.treatmentPlanItemId);
    if (!item) throw new NotFoundException(`Treatment plan item "${input.treatmentPlanItemId}" not found`);
    if (item.clinicId !== input.clinicId) throw new BadRequestException("Treatment item does not belong to this clinic");
    const now = new Date();
    return this.repository.updateTreatmentPlanItem(item.id, {
      status: input.status,
      cancellationReason: input.status === "CANCELLED" ? input.reason : undefined,
      cancelledAt: input.status === "CANCELLED" ? now : undefined,
      voidReason: input.status === "VOIDED" ? input.reason : undefined,
      voidedAt: input.status === "VOIDED" ? now : undefined,
      statusChangedAt: now,
      statusChangedBy: input.providerId,
    });
  }

  saveClinicalAttachments(input: {attachments: ClinicalAttachment[]}): Promise<ClinicalAttachment[]> {
    return this.repository.saveClinicalAttachments(input.attachments);
  }

  private location(input: {
    selectedTeeth: number[];
    mouthRegionId?: string;
    surfacesByTooth: Record<number, SurfaceCode[]>;
    dentition: TreatmentLocation["dentition"];
  }): TreatmentLocation {
    const surfaces = Array.from(
      new Set(Object.values(input.surfacesByTooth).flat()),
    );
    return {
      tooth: input.selectedTeeth.length === 1 ? input.selectedTeeth[0] : undefined,
      toothIds: input.selectedTeeth.length ? input.selectedTeeth : undefined,
      mouthRegionId: input.mouthRegionId,
      label: input.mouthRegionId
        ? input.mouthRegionId
        : input.selectedTeeth.length
          ? input.selectedTeeth.join(", ")
          : "General",
      surfaces,
      surfacesByTooth: input.surfacesByTooth,
      dentition: input.dentition,
    };
  }
}
