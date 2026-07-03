import type {
  CloseVisitCommand,
  CreateVisitFromQueueCommand,
} from "@/application/treatment/commands";
import type {GetTreatmentWorkspaceQuery} from "@/application/treatment/queries";
import {TREATMENT_ACTS} from "@/domain/treatment/catalogs";
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
import {
  TREATMENT_DEMO_ACTIVE_VISIT,
  TREATMENT_DEMO_CHARGES,
  TREATMENT_DEMO_CURRENT_SESSION,
  TREATMENT_DEMO_DIAGNOSES,
  TREATMENT_DEMO_PRIOR_VISIT_HANDOFFS,
  TREATMENT_DEMO_PLAN,
  TREATMENT_DEMO_PRIOR_VISIT_PROCEDURES,
} from "./treatmentWorkspace.seed";
import {
  fromDomainDentalAct,
  toDomainDentalAct,
  toDomainTreatmentCharge,
  toDomainTreatmentPlanItem,
  toDomainVisitHandoff,
  toDomainVisitProcedure,
} from "../mappers";

const pageActs = TREATMENT_ACTS.map(fromDomainDentalAct);

function cloneDate<T extends Date | undefined>(date: T): T {
  return (date ? new Date(date) : undefined) as T;
}

function cloneVisit(visit: Visit): Visit {
  return {
    ...visit,
    startedAt: cloneDate(visit.startedAt),
    closedAt: cloneDate(visit.closedAt),
    cancelledAt: cloneDate(visit.cancelledAt),
  };
}

function clonePlanItem(item: TreatmentPlanItem): TreatmentPlanItem {
  return {
    ...item,
    location: {
      ...item.location,
      toothIds: item.location.toothIds
        ? [...item.location.toothIds]
        : undefined,
      surfaces: [...item.location.surfaces],
      surfacesByTooth: item.location.surfacesByTooth
        ? {...item.location.surfacesByTooth}
        : undefined,
    },
    visitProcedureIds: [...item.visitProcedureIds],
    createdAt: cloneDate(item.createdAt),
    startedAt: cloneDate(item.startedAt),
    completedAt: cloneDate(item.completedAt),
    cancelledAt: cloneDate(item.cancelledAt),
    voidedAt: cloneDate(item.voidedAt),
  };
}

function cloneProcedure(procedure: VisitProcedure): VisitProcedure {
  return {
    ...procedure,
    location: {
      ...procedure.location,
      toothIds: procedure.location.toothIds
        ? [...procedure.location.toothIds]
        : undefined,
      surfaces: [...procedure.location.surfaces],
      surfacesByTooth: procedure.location.surfacesByTooth
        ? {...procedure.location.surfacesByTooth}
        : undefined,
    },
    performedAt: cloneDate(procedure.performedAt),
    completedAt: cloneDate(procedure.completedAt),
  };
}

function cloneDiagnosis(diagnosis: Diagnosis): Diagnosis {
  return {
    ...diagnosis,
    location: {
      ...diagnosis.location,
      toothIds: diagnosis.location.toothIds
        ? [...diagnosis.location.toothIds]
        : undefined,
      surfaces: [...diagnosis.location.surfaces],
      surfacesByTooth: diagnosis.location.surfacesByTooth
        ? {...diagnosis.location.surfacesByTooth}
        : undefined,
    },
    evidence: [...diagnosis.evidence],
    attachmentIds: [...diagnosis.attachmentIds],
    symptoms: [...diagnosis.symptoms],
    createdAt: cloneDate(diagnosis.createdAt),
  };
}

function cloneAttachment(attachment: ClinicalAttachment): ClinicalAttachment {
  return {
    ...attachment,
    uploadedAt: cloneDate(attachment.uploadedAt),
  };
}

function cloneCharge(charge: TreatmentCharge): TreatmentCharge {
  return {...charge, createdAt: cloneDate(charge.createdAt)};
}

function cloneHandoff(handoff: VisitHandoff): VisitHandoff {
  return {
    ...handoff,
    savedAt: cloneDate(handoff.savedAt),
    codedAt: cloneDate(handoff.codedAt),
  };
}

export class InMemoryTreatmentWorkspaceRepository
  implements TreatmentRepository, VisitWorkflowRepository
{
  private visits: Visit[] = [
    {
      ...TREATMENT_DEMO_ACTIVE_VISIT,
      clinicId: "clinic_demo",
      status: "OPEN",
      source: "QUEUE",
      startedAt: new Date(TREATMENT_DEMO_ACTIVE_VISIT.startedAt),
    },
  ];

  private groups: TreatmentGroup[] = [];

  private treatmentPlan: TreatmentPlanItem[] = TREATMENT_DEMO_PLAN.map((item) =>
    toDomainTreatmentPlanItem(item, {
      patientId: TREATMENT_DEMO_ACTIVE_VISIT.patientId,
      acts: pageActs,
    }),
  );

  private procedures: VisitProcedure[] = [
    ...TREATMENT_DEMO_PRIOR_VISIT_PROCEDURES,
    ...TREATMENT_DEMO_CURRENT_SESSION,
  ].map((item) =>
    toDomainVisitProcedure(item, {
      patientId: TREATMENT_DEMO_ACTIVE_VISIT.patientId,
      acts: pageActs,
    }),
  );

  private diagnoses: Diagnosis[] = TREATMENT_DEMO_DIAGNOSES.map((item) => ({
    id: item.id,
    clinicId: "clinic_demo",
    patientId: TREATMENT_DEMO_ACTIVE_VISIT.patientId,
    diagnosis: item.diagnosis,
    location: {
      tooth: typeof item.tooth === "number" ? item.tooth : undefined,
      toothIds: item.toothIds,
      label: String(item.tooth),
      surfaces: item.surfaces,
      surfacesByTooth: item.surfacesByTooth,
      dentition: item.dentition === "child" ? "CHILD" : item.dentition === "mixed" ? "MIXED" : "ADULT",
    },
    severity:
      item.severity === "Severe"
        ? "SEVERE"
        : item.severity === "Mild"
          ? "MILD"
          : "MODERATE",
    certainty: "CONFIRMED",
    status: "ACTIVE",
    evidence: [],
    attachmentIds: [],
    symptoms: [],
    painLevel: 0,
    notes: item.notes,
    createdAt: new Date(`${item.date}T00:00:00.000Z`),
    createdBy: "provider_current",
  }));

  private attachments: ClinicalAttachment[] = [];

  private charges: TreatmentCharge[] =
    TREATMENT_DEMO_CHARGES.map(toDomainTreatmentCharge);

  private handoffs: VisitHandoff[] =
    TREATMENT_DEMO_PRIOR_VISIT_HANDOFFS.map(toDomainVisitHandoff);

  private followUpRequests: FollowUpRequest[] = [];
  private documentRequests: MedicalDocumentRequest[] = [];

  async getWorkspace(
    query: GetTreatmentWorkspaceQuery,
  ): Promise<TreatmentWorkspace> {
    const activeVisit = this.visits.find(
      (visit) =>
        visit.clinicId === query.clinicId &&
        visit.patientId === query.patientId &&
        (query.activeVisitId ? visit.id === query.activeVisitId : true) &&
        ["OPEN", "NEEDS_CODING"].includes(visit.status),
    );

    return {
      activeVisit: activeVisit
        ? cloneVisit(activeVisit)
        : undefined,
      acts: pageActs.map(toDomainDentalAct),
      treatmentPlan: this.treatmentPlan
        .filter((item) => item.patientId === query.patientId)
        .map(clonePlanItem),
      currentSession: this.procedures
        .filter(
          (procedure) =>
            procedure.patientId === query.patientId &&
            (!activeVisit || procedure.visitId === activeVisit.id),
        )
        .map(cloneProcedure),
      diagnoses: this.diagnoses
        .filter((diagnosis) => diagnosis.patientId === query.patientId)
        .map(cloneDiagnosis),
      attachments: this.attachments
        .filter((attachment) => attachment.patientId === query.patientId)
        .map(cloneAttachment),
      charges: this.charges
        .filter((charge) => charge.patientId === query.patientId)
        .map(cloneCharge),
      handoffs: this.handoffs
        .filter((handoff) => handoff.patientId === query.patientId)
        .map(cloneHandoff),
      followUpRequests: this.followUpRequests.filter(
        (request) => request.patientId === query.patientId,
      ),
      documentRequests: this.documentRequests.filter(
        (request) => request.patientId === query.patientId,
      ),
    };
  }

  async createVisit(command: CreateVisitFromQueueCommand) {
    const existingForQueue = await this.getVisitByQueueEntry(
      command.clinicId,
      command.queueEntryId,
    );
    if (existingForQueue) return existingForQueue;

    const activeForPatient = await this.getActiveVisitByPatient(
      command.clinicId,
      command.patientId,
    );
    if (activeForPatient) return activeForPatient;

    const visit: Visit = {
      id: `visit_${command.queueEntryId}`,
      clinicId: command.clinicId,
      patientId: command.patientId,
      queueEntryId: command.queueEntryId,
      appointmentId: command.appointmentId,
      chairId: command.chairId,
      providerId: command.providerId,
      status: "OPEN",
      source: "QUEUE",
      startedAt: command.startedAt ?? new Date(),
    };

    this.visits.push(cloneVisit(visit));
    return cloneVisit(visit);
  }

  async getActiveVisitByPatient(clinicId: string, patientId: string) {
    const visit = this.visits.find(
      (item) =>
        item.clinicId === clinicId &&
        item.patientId === patientId &&
        ["OPEN", "NEEDS_CODING"].includes(item.status),
    );
    return visit ? cloneVisit(visit) : null;
  }

  async getVisitByQueueEntry(clinicId: string, queueEntryId: string) {
    const visit = this.visits.find(
      (item) => item.clinicId === clinicId && item.queueEntryId === queueEntryId,
    );
    return visit ? cloneVisit(visit) : null;
  }

  async updateVisitStatus(
    visitId: string,
    status: Visit["status"],
    changedBy: string,
  ) {
    void changedBy;
    const index = this.visits.findIndex((visit) => visit.id === visitId);
    if (index < 0) throw new Error(`Visit "${visitId}" not found`);
    this.visits[index] = cloneVisit({
      ...this.visits[index],
      status,
      closedAt: status === "CLOSED" ? new Date() : this.visits[index].closedAt,
    });
    return cloneVisit(this.visits[index]);
  }

  async saveHandoff(handoff: VisitHandoff) {
    return this.saveVisitHandoff(handoff);
  }

  async markHandoffCoded(handoffId: string, codedBy: string) {
    return this.updateVisitHandoff(handoffId, {
      status: "CODED",
      codedAt: new Date(),
      codedBy,
    });
  }

  async closeVisit(command: CloseVisitCommand) {
    await this.updateVisitStatus(command.visitId, "CLOSED", command.providerId);
  }

  async createFollowUpRequest(request: FollowUpRequest) {
    return this.saveFollowUpRequest(request);
  }

  async createDocumentRequest(request: MedicalDocumentRequest) {
    return this.saveDocumentRequest(request);
  }

  async getTreatmentPlanItem(id: string) {
    const item = this.treatmentPlan.find((planItem) => planItem.id === id);
    if (!item) throw new Error(`Treatment plan item "${id}" not found`);
    return clonePlanItem(item);
  }

  async saveTreatmentPlanItems(items: TreatmentPlanItem[]) {
    items.forEach((item) => {
      const index = this.treatmentPlan.findIndex(
        (current) => current.id === item.id,
      );
      if (index >= 0) {
        this.treatmentPlan[index] = clonePlanItem(item);
      } else {
        this.treatmentPlan.push(clonePlanItem(item));
      }
    });
    return items.map(clonePlanItem);
  }

  async updateTreatmentPlanItem(id: string, patch: Partial<TreatmentPlanItem>) {
    const index = this.treatmentPlan.findIndex((item) => item.id === id);
    if (index < 0) throw new Error(`Treatment plan item "${id}" not found`);
    this.treatmentPlan[index] = clonePlanItem({
      ...this.treatmentPlan[index],
      ...patch,
    });
    return clonePlanItem(this.treatmentPlan[index]);
  }

  async saveTreatmentGroup(group: TreatmentGroup) {
    const index = this.groups.findIndex((item) => item.id === group.id);
    if (index >= 0) {
      this.groups[index] = {...group, toothIds: [...group.toothIds]};
    } else {
      this.groups.push({...group, toothIds: [...group.toothIds]});
    }
    return {...group, toothIds: [...group.toothIds]};
  }

  async saveVisitProcedure(procedure: VisitProcedure) {
    const index = this.procedures.findIndex((item) => item.id === procedure.id);
    if (index >= 0) {
      this.procedures[index] = cloneProcedure(procedure);
    } else {
      this.procedures.push(cloneProcedure(procedure));
    }
    return cloneProcedure(procedure);
  }

  async updateVisitProcedure(id: string, patch: Partial<VisitProcedure>) {
    const index = this.procedures.findIndex((item) => item.id === id);
    if (index < 0) throw new Error(`Visit procedure "${id}" not found`);
    this.procedures[index] = cloneProcedure({
      ...this.procedures[index],
      ...patch,
    });
    return cloneProcedure(this.procedures[index]);
  }

  async saveDiagnosis(diagnosis: Diagnosis) {
    const index = this.diagnoses.findIndex((item) => item.id === diagnosis.id);
    if (index >= 0) this.diagnoses[index] = cloneDiagnosis(diagnosis);
    else this.diagnoses.push(cloneDiagnosis(diagnosis));
    return cloneDiagnosis(diagnosis);
  }

  async saveClinicalAttachments(attachments: ClinicalAttachment[]) {
    attachments.forEach((attachment) => {
      const index = this.attachments.findIndex(
        (current) => current.id === attachment.id,
      );
      if (index >= 0) {
        this.attachments[index] = cloneAttachment(attachment);
      } else {
        this.attachments.push(cloneAttachment(attachment));
      }
    });
    return attachments.map(cloneAttachment);
  }

  async saveTreatmentCharge(charge: TreatmentCharge) {
    const index = this.charges.findIndex((item) => item.id === charge.id);
    if (index >= 0) this.charges[index] = cloneCharge(charge);
    else this.charges.push(cloneCharge(charge));
    return cloneCharge(charge);
  }

  async saveVisitHandoff(handoff: VisitHandoff) {
    const index = this.handoffs.findIndex((item) => item.id === handoff.id);
    if (index >= 0) this.handoffs[index] = cloneHandoff(handoff);
    else this.handoffs.push(cloneHandoff(handoff));
    return cloneHandoff(handoff);
  }

  async updateVisitHandoff(id: string, patch: Partial<VisitHandoff>) {
    const index = this.handoffs.findIndex((item) => item.id === id);
    if (index < 0) throw new Error(`Visit handoff "${id}" not found`);
    this.handoffs[index] = cloneHandoff({...this.handoffs[index], ...patch});
    return cloneHandoff(this.handoffs[index]);
  }

  async saveFollowUpRequest(request: FollowUpRequest) {
    this.followUpRequests.push({...request});
    return {...request};
  }

  async saveDocumentRequest(request: MedicalDocumentRequest) {
    this.documentRequests.push({...request});
    return {...request};
  }
}
