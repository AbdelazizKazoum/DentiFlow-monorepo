import type {
  CloseVisitCommand,
  CreateVisitFromQueueCommand,
} from "@/application/treatment/commands";
import type {GetTreatmentWorkspaceQuery} from "@/application/treatment/queries";
import type {
  ClinicalAttachment,
  Diagnosis,
  FollowUpRequest,
  MedicalDocumentRequest,
  TreatmentCharge,
  TreatmentGroup,
  TreatmentPlanItem,
  Visit,
  VisitHandoff,
  VisitProcedure,
} from "@/domain/treatment/entities";
import type {
  TreatmentRepository,
  TreatmentWorkspace,
  VisitWorkflowRepository,
} from "@/domain/treatment/repositories";
import {getLocationToothIds} from "@/domain/treatment/services";
import {axiosClient} from "@/infrastructure/http/axiosClient";
import {BaseRepository} from "@/infrastructure/http/BaseRepository";

const toDate = (value?: string | Date): Date | undefined =>
  value ? new Date(value) : undefined;

const visit = (item: any): Visit => ({
  ...item,
  startedAt: new Date(item.startedAt),
  closedAt: toDate(item.closedAt),
  cancelledAt: toDate(item.cancelledAt),
});

const planItem = (item: any): TreatmentPlanItem => ({
  ...item,
  createdAt: new Date(item.createdAt),
  startedAt: toDate(item.startedAt),
  completedAt: toDate(item.completedAt),
  cancelledAt: toDate(item.cancelledAt),
  voidedAt: toDate(item.voidedAt),
});

const procedure = (item: any): VisitProcedure => ({
  ...item,
  performedAt: new Date(item.performedAt),
  completedAt: toDate(item.completedAt),
});

const diagnosis = (item: any): Diagnosis => ({
  ...item,
  createdAt: new Date(item.createdAt),
});

const attachment = (item: any): ClinicalAttachment => ({
  ...item,
  uploadedAt: new Date(item.uploadedAt),
});

const charge = (item: any): TreatmentCharge => ({
  ...item,
  createdAt: new Date(item.createdAt),
});

const handoff = (item: any): VisitHandoff => ({
  ...item,
  savedAt: new Date(item.savedAt),
  codedAt: toDate(item.codedAt),
});

const followUp = (item: any): FollowUpRequest => ({
  ...item,
  preferredDate: toDate(item.preferredDate),
  requestedAt: new Date(item.requestedAt),
});

const documentRequest = (item: any): MedicalDocumentRequest => ({
  ...item,
  requestedAt: new Date(item.requestedAt),
});

export class ApiTreatmentRepository
  extends BaseRepository
  implements TreatmentRepository, VisitWorkflowRepository
{
  private readonly planItemCache = new Map<string, TreatmentPlanItem>();

  async getWorkspace(query: GetTreatmentWorkspaceQuery): Promise<TreatmentWorkspace> {
    return this.execute(async () => {
      const {data} = await axiosClient.get("/api/v1/treatment/workspace", {
        params: query,
      });
      const treatmentPlan = data.treatmentPlan.map(planItem);
      treatmentPlan.forEach((item: TreatmentPlanItem) => {
        this.planItemCache.set(item.id, item);
      });
      return {
        activeVisit: data.activeVisit ? visit(data.activeVisit) : undefined,
        acts: data.acts,
        treatmentPlan,
        currentSession: data.currentSession.map(procedure),
        diagnoses: data.diagnoses.map(diagnosis),
        attachments: data.attachments.map(attachment),
        charges: data.charges.map(charge),
        handoffs: data.handoffs.map(handoff),
        followUpRequests: data.followUpRequests.map(followUp),
        documentRequests: data.documentRequests.map(documentRequest),
      };
    });
  }

  async createVisit(command: CreateVisitFromQueueCommand): Promise<Visit> {
    return this.execute(async () => {
      const {data} = await axiosClient.post(
        "/api/v1/treatment/visits/from-queue",
        command,
      );
      return visit(data);
    });
  }

  async getActiveVisitByPatient(
    clinicId: string,
    patientId: string,
  ): Promise<Visit | null> {
    const workspace = await this.getWorkspace({clinicId, patientId});
    return workspace.activeVisit ?? null;
  }

  async getVisitByQueueEntry(): Promise<Visit | null> {
    return null;
  }

  async updateVisitStatus(
    visitId: string,
    status: Visit["status"],
    changedBy: string,
  ): Promise<Visit> {
    void status;
    void changedBy;
    throw new Error(`Direct visit status updates are not exposed for "${visitId}".`);
  }

  async closeVisit(command: CloseVisitCommand): Promise<void> {
    await this.closeVisitWithResult(command);
  }

  async closeVisitWithResult(command: CloseVisitCommand): Promise<{
    followUpRequest?: FollowUpRequest;
    documentRequest?: MedicalDocumentRequest;
  }> {
    return this.execute(async () => {
      const {data} = await axiosClient.post(
        `/api/v1/treatment/visits/${command.visitId}/close`,
        command,
      );
      return {
        followUpRequest: data.followUpRequest
          ? followUp(data.followUpRequest)
          : undefined,
        documentRequest: data.documentRequest
          ? documentRequest(data.documentRequest)
          : undefined,
      };
    });
  }

  async getTreatmentPlanItem(id: string): Promise<TreatmentPlanItem> {
    const item = this.planItemCache.get(id);
    if (!item) throw new Error(`Treatment plan item "${id}" not found`);
    return item;
  }

  async saveTreatmentPlanItems(
    items: TreatmentPlanItem[],
  ): Promise<TreatmentPlanItem[]> {
    return this.execute(async () => {
      if (!items[0]) return [];
      const selectedTeeth = [
        ...new Set(items.flatMap((item) => getLocationToothIds(item.location))),
      ];
      const surfacesByTooth = items.reduce<Record<number, string[]>>(
        (acc, item) => {
          if (item.location.surfacesByTooth) {
            Object.entries(item.location.surfacesByTooth).forEach(
              ([tooth, surfaces]) => {
                acc[Number(tooth)] = surfaces;
              },
            );
          }
          if (
            typeof item.location.tooth === "number" &&
            item.location.surfaces.length > 0
          ) {
            acc[item.location.tooth] = item.location.surfaces;
          }
          return acc;
        },
        {},
      );
      const {data} = await axiosClient.post("/api/v1/treatment/plan-items", {
        clinicId: items[0].clinicId,
        patientId: items[0].patientId,
        actId: items[0].actId,
        selectedTeeth,
        mouthRegionId: items[0].location.mouthRegionId,
        surfacesByTooth,
        priority: items[0].priority,
        notes: items[0].notes,
        dentition: items[0].location.dentition,
        providerId: items[0].createdBy,
      });
      const saved = data.items.map(planItem);
      saved.forEach((item: TreatmentPlanItem) => this.planItemCache.set(item.id, item));
      return saved;
    });
  }

  async updateTreatmentPlanItem(
    id: string,
    patch: Partial<TreatmentPlanItem>,
  ): Promise<TreatmentPlanItem> {
    return this.execute(async () => {
      const {data} = await axiosClient.patch(
        `/api/v1/treatment/plan-items/${id}/status`,
        {
          clinicId: patch.clinicId,
          status: patch.status,
          reason: patch.cancellationReason ?? patch.voidReason ?? "",
          providerId: patch.createdBy ?? "",
        },
      );
      const item = planItem(data);
      this.planItemCache.set(item.id, item);
      return item;
    });
  }

  async saveTreatmentGroup(group: TreatmentGroup): Promise<TreatmentGroup> {
    return group;
  }

  async saveVisitProcedure(procedureInput: VisitProcedure): Promise<VisitProcedure> {
    return procedureInput;
  }

  async updateVisitProcedure(
    id: string,
    patch: Partial<VisitProcedure>,
  ): Promise<VisitProcedure> {
    return this.execute(async () => {
      const {data} = await axiosClient.post(
        `/api/v1/treatment/procedures/${id}/complete`,
        {
          clinicId: patch.clinicId,
          patientId: patch.patientId,
          providerId: patch.providerId,
        },
      );
      return procedure(data.procedure);
    });
  }

  async startTreatmentWithResult(command: {
    clinicId: string;
    patientId: string;
    visitId: string;
    treatmentPlanItemId: string;
    providerId: string;
  }) {
    return this.execute(async () => {
      const {data} = await axiosClient.post("/api/v1/treatment/start", command);
      const treatmentItem = planItem(data.treatmentItem);
      this.planItemCache.set(treatmentItem.id, treatmentItem);
      return {
        treatmentItem,
        procedure: procedure(data.procedure),
        charge: data.charge ? charge(data.charge) : undefined,
        reusedExistingProcedure: data.reusedExistingProcedure,
      };
    });
  }

  async completeVisitProcedureWithResult(command: {
    clinicId: string;
    patientId?: string;
    visitProcedureId: string;
    providerId: string;
  }) {
    return this.execute(async () => {
      const {data} = await axiosClient.post(
        `/api/v1/treatment/procedures/${command.visitProcedureId}/complete`,
        command,
      );
      const treatmentItem = data.treatmentItem
        ? planItem(data.treatmentItem)
        : undefined;
      if (treatmentItem) this.planItemCache.set(treatmentItem.id, treatmentItem);
      return {
        procedure: procedure(data.procedure),
        treatmentItem,
      };
    });
  }

  async saveDiagnosis(diagnosisInput: Diagnosis): Promise<Diagnosis> {
    return this.execute(async () => {
      const {data} = await axiosClient.post("/api/v1/treatment/diagnoses", {
        clinicId: diagnosisInput.clinicId,
        patientId: diagnosisInput.patientId,
        diagnosis: diagnosisInput.diagnosis,
        selectedTeeth: diagnosisInput.location.toothIds ?? [],
        mouthRegionId: diagnosisInput.location.mouthRegionId,
        surfacesByTooth: diagnosisInput.location.surfacesByTooth ?? {},
        severity: diagnosisInput.severity,
        certainty: diagnosisInput.certainty,
        status: diagnosisInput.status,
        evidence: diagnosisInput.evidence,
        attachmentIds: diagnosisInput.attachmentIds,
        symptoms: diagnosisInput.symptoms,
        painLevel: diagnosisInput.painLevel,
        notes: diagnosisInput.notes,
        dentition: diagnosisInput.location.dentition,
        providerId: diagnosisInput.createdBy,
      });
      return diagnosis(data);
    });
  }

  async saveClinicalAttachments(
    attachments: ClinicalAttachment[],
  ): Promise<ClinicalAttachment[]> {
    return this.execute(async () => {
      const {data} = await axiosClient.post("/api/v1/treatment/attachments", {
        attachments,
      });
      return data.attachments.map(attachment);
    });
  }

  async saveTreatmentCharge(chargeInput: TreatmentCharge): Promise<TreatmentCharge> {
    return chargeInput;
  }

  async saveHandoff(handoffInput: VisitHandoff): Promise<VisitHandoff> {
    return this.saveVisitHandoff(handoffInput);
  }

  async saveVisitHandoff(handoffInput: VisitHandoff): Promise<VisitHandoff> {
    return this.execute(async () => {
      const {data} = await axiosClient.post("/api/v1/treatment/handoffs", {
        clinicId: handoffInput.clinicId,
        patientId: handoffInput.patientId,
        visitId: handoffInput.visitId,
        text: handoffInput.text,
        status: handoffInput.status,
        providerId: handoffInput.authoredBy,
        treatmentPlanItemId: handoffInput.treatmentPlanItemId,
      });
      return handoff(data);
    });
  }

  async updateVisitHandoff(): Promise<VisitHandoff> {
    throw new Error("Visit handoff updates are not exposed by the treatment API.");
  }

  async markHandoffCoded(): Promise<VisitHandoff> {
    throw new Error("Coding handoff is not exposed by the treatment API.");
  }

  async createFollowUpRequest(request: FollowUpRequest): Promise<FollowUpRequest> {
    return request;
  }

  async saveFollowUpRequest(request: FollowUpRequest): Promise<FollowUpRequest> {
    return request;
  }

  async createDocumentRequest(
    request: MedicalDocumentRequest,
  ): Promise<MedicalDocumentRequest> {
    return request;
  }

  async saveDocumentRequest(
    request: MedicalDocumentRequest,
  ): Promise<MedicalDocumentRequest> {
    return request;
  }
}
