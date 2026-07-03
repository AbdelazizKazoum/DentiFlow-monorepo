import type {
  ClinicalAttachment as DomainClinicalAttachment,
  DentalAct,
  Diagnosis,
  DiagnosisCertainty,
  DiagnosisEvidence,
  DiagnosisSeverity,
  DiagnosisStatus,
  DentitionMode,
  DocumentRequestType,
  FollowUpUrgency,
  TreatmentCharge,
  TreatmentGroup,
  TreatmentPlanItem,
  TreatmentPriority,
  TreatmentStatus,
  VisitCodingStatus,
  VisitHandoff,
  VisitProcedure,
} from "@/domain/treatment/entities";
import {
  getActVisualColor,
  getActVisualStyle,
} from "@/domain/treatment/services";
import type {
  TreatmentPageClinicalAttachmentDTO,
  TreatmentPageDentalActDTO,
  TreatmentPageDentitionMode,
  TreatmentPageDiagnosisCertainty,
  TreatmentPageDiagnosisDTO,
  TreatmentPageDiagnosisSeverity,
  TreatmentPageDiagnosisStatus,
  TreatmentPageDocumentRequestTypeId,
  TreatmentPageFollowUpUrgency,
  TreatmentPagePriority,
  TreatmentPageStatus,
  TreatmentPageSurfaceCode,
  TreatmentPageTreatmentBaseDTO,
  TreatmentPageTreatmentChargeDTO,
  TreatmentPageTreatmentGroupDTO,
  TreatmentPageTreatmentPlanItemDTO,
  TreatmentPageVisitCodingStatus,
  TreatmentPageVisitHandoffDTO,
  TreatmentPageVisitProcedureDTO,
} from "../dtos";

export const toDomainDentition = (
  mode: TreatmentPageDentitionMode,
): DentitionMode =>
  ({adult: "ADULT", child: "CHILD", mixed: "MIXED"})[mode] as DentitionMode;

export const fromDomainDentition = (
  mode: DentitionMode,
): TreatmentPageDentitionMode =>
  ({ADULT: "adult", CHILD: "child", MIXED: "mixed"})[
    mode
  ] as TreatmentPageDentitionMode;

export const toDomainPriority = (
  priority: TreatmentPagePriority,
): TreatmentPriority =>
  ({Low: "LOW", Normal: "NORMAL", High: "HIGH"})[
    priority
  ] as TreatmentPriority;

export const fromDomainPriority = (
  priority: TreatmentPriority,
): TreatmentPagePriority =>
  ({LOW: "Low", NORMAL: "Normal", HIGH: "High"})[
    priority
  ] as TreatmentPagePriority;

export const toDomainTreatmentStatus = (
  status: TreatmentPageStatus,
): TreatmentStatus =>
  ({
    proposed: "PROPOSED",
    accepted: "ACCEPTED",
    scheduled: "SCHEDULED",
    in_progress: "IN_PROGRESS",
    completed: "COMPLETED",
    declined: "DECLINED",
    cancelled: "CANCELLED",
    voided: "VOIDED",
  })[status] as TreatmentStatus;

export const fromDomainTreatmentStatus = (
  status: TreatmentStatus,
): TreatmentPageStatus =>
  ({
    PROPOSED: "proposed",
    ACCEPTED: "accepted",
    SCHEDULED: "scheduled",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    DECLINED: "declined",
    CANCELLED: "cancelled",
    VOIDED: "voided",
  })[status] as TreatmentPageStatus;

export const toDomainVisitCodingStatus = (
  status: TreatmentPageVisitCodingStatus,
): VisitCodingStatus =>
  ({
    structured: "STRUCTURED",
    draft_note: "DRAFT_NOTE",
    needs_coding: "NEEDS_CODING",
    coded: "CODED",
  })[status] as VisitCodingStatus;

export const fromDomainVisitCodingStatus = (
  status: VisitCodingStatus,
): TreatmentPageVisitCodingStatus =>
  ({
    STRUCTURED: "structured",
    DRAFT_NOTE: "draft_note",
    NEEDS_CODING: "needs_coding",
    CODED: "coded",
  })[status] as TreatmentPageVisitCodingStatus;

export const toDomainDocumentType = (
  type: TreatmentPageDocumentRequestTypeId,
): DocumentRequestType =>
  ({
    prescription: "PRESCRIPTION",
    medical_certificate: "MEDICAL_CERTIFICATE",
    clinical_report: "CLINICAL_REPORT",
  })[type] as DocumentRequestType;

export const fromDomainDocumentType = (
  type: DocumentRequestType,
): TreatmentPageDocumentRequestTypeId =>
  ({
    PRESCRIPTION: "prescription",
    MEDICAL_CERTIFICATE: "medical_certificate",
    CLINICAL_REPORT: "clinical_report",
  })[type] as TreatmentPageDocumentRequestTypeId;

export const toDomainFollowUpUrgency = (
  urgency: TreatmentPageFollowUpUrgency,
): FollowUpUrgency =>
  ({Routine: "ROUTINE", Soon: "SOON", Urgent: "URGENT"})[
    urgency
  ] as FollowUpUrgency;

export const fromDomainFollowUpUrgency = (
  urgency: FollowUpUrgency,
): TreatmentPageFollowUpUrgency =>
  ({ROUTINE: "Routine", SOON: "Soon", URGENT: "Urgent"})[
    urgency
  ] as TreatmentPageFollowUpUrgency;

export const toDomainDiagnosisSeverity = (
  severity: TreatmentPageDiagnosisSeverity,
): DiagnosisSeverity =>
  ({Mild: "MILD", Moderate: "MODERATE", Severe: "SEVERE"})[
    severity
  ] as DiagnosisSeverity;

export const fromDomainDiagnosisSeverity = (
  severity: DiagnosisSeverity,
): TreatmentPageDiagnosisSeverity =>
  ({MILD: "Mild", MODERATE: "Moderate", SEVERE: "Severe"})[
    severity
  ] as TreatmentPageDiagnosisSeverity;

export const toDomainDiagnosisCertainty = (
  certainty: TreatmentPageDiagnosisCertainty,
): DiagnosisCertainty =>
  ({
    Suspected: "SUSPECTED",
    Confirmed: "CONFIRMED",
    "Ruled out": "RULED_OUT",
  })[certainty] as DiagnosisCertainty;

export const fromDomainDiagnosisCertainty = (
  certainty: DiagnosisCertainty,
): TreatmentPageDiagnosisCertainty =>
  ({
    SUSPECTED: "Suspected",
    CONFIRMED: "Confirmed",
    RULED_OUT: "Ruled out",
  })[certainty] as TreatmentPageDiagnosisCertainty;

export const toDomainDiagnosisStatus = (
  status: TreatmentPageDiagnosisStatus,
): DiagnosisStatus =>
  ({Active: "ACTIVE", Resolved: "RESOLVED", Monitoring: "MONITORING"})[
    status
  ] as DiagnosisStatus;

export const fromDomainDiagnosisStatus = (
  status: DiagnosisStatus,
): TreatmentPageDiagnosisStatus =>
  ({ACTIVE: "Active", RESOLVED: "Resolved", MONITORING: "Monitoring"})[
    status
  ] as TreatmentPageDiagnosisStatus;

const DIAGNOSIS_EVIDENCE_TO_DOMAIN: Record<string, DiagnosisEvidence> = {
  "Visual exam": "VISUAL_EXAM",
  "X-ray": "X_RAY",
  "Percussion test": "PERCUSSION_TEST",
  "Cold test": "COLD_TEST",
  "Periodontal probing": "PERIODONTAL_PROBING",
};

const DIAGNOSIS_EVIDENCE_FROM_DOMAIN: Record<DiagnosisEvidence, string> = {
  VISUAL_EXAM: "Visual exam",
  X_RAY: "X-ray",
  PERCUSSION_TEST: "Percussion test",
  COLD_TEST: "Cold test",
  PERIODONTAL_PROBING: "Periodontal probing",
};

export const toDomainEvidence = (evidence: string[]): DiagnosisEvidence[] =>
  evidence
    .map((item) => DIAGNOSIS_EVIDENCE_TO_DOMAIN[item])
    .filter((item): item is DiagnosisEvidence => Boolean(item));

export const fromDomainEvidence = (evidence: DiagnosisEvidence[]): string[] =>
  evidence.map((item) => DIAGNOSIS_EVIDENCE_FROM_DOMAIN[item]);

export const fromDomainDentalAct = (
  act: DentalAct,
): TreatmentPageDentalActDTO => ({
  id: act.id,
  name: act.name,
  category: act.category,
  price: act.price,
  groupableTeeth: act.groupableTeeth,
  visualType:
    act.visualType === "crown" ||
    act.visualType === "extraction" ||
    act.visualType === "implant"
      ? act.visualType
      : undefined,
});

export const toDomainDentalAct = (
  act: TreatmentPageDentalActDTO,
): DentalAct => ({
  id: act.id,
  name: act.name,
  label: act.name,
  icon: "Activity",
  category: act.category as DentalAct["category"],
  price: act.price,
  groupableTeeth: Boolean(act.groupableTeeth),
  visualType: act.visualType,
  affectsTooth: getActVisualStyle(act.name).affectsTooth,
  defaultStatus: "planned",
  colorHex: getActVisualColor(act.name, "planned") ?? "#64748b",
});

export const fromDomainClinicalAttachment = (
  attachment: DomainClinicalAttachment,
): TreatmentPageClinicalAttachmentDTO => ({
  id: attachment.id,
  type: "radiology",
  title: attachment.title,
  fileName: attachment.fileName,
  fileUrl: attachment.fileUrl,
  visitId: attachment.visitId ?? "",
  uploadedAt: attachment.uploadedAt.toISOString(),
  uploadedBy: attachment.uploadedBy,
});

export const toDomainClinicalAttachment = (
  attachment: TreatmentPageClinicalAttachmentDTO,
  context: {clinicId: string; patientId: string},
): DomainClinicalAttachment => ({
  id: attachment.id,
  clinicId: context.clinicId,
  patientId: context.patientId,
  visitId: attachment.visitId || undefined,
  type: "RADIOLOGY",
  title: attachment.title,
  fileName: attachment.fileName,
  mimeType: "application/octet-stream",
  fileUrl: attachment.fileUrl,
  uploadedAt: new Date(attachment.uploadedAt),
  uploadedBy: attachment.uploadedBy,
});

export const getTreatmentLocationLabel = (
  item: Pick<TreatmentPageTreatmentBaseDTO, "tooth" | "toothIds">,
): string =>
  item.toothIds?.length
    ? `Teeth ${item.toothIds.join(", ")}`
    : String(item.tooth);

export const getTreatmentAreaLabel = (
  item: Pick<TreatmentPageTreatmentBaseDTO, "surfaces" | "toothIds">,
): string => {
  if (item.surfaces?.length) return item.surfaces.join(", ");
  if (item.toothIds?.length) return "Full selected teeth";
  return "Full tooth";
};

export function toDomainTreatmentPlanItem(
  item: TreatmentPageTreatmentPlanItemDTO,
  context: {patientId: string; acts: TreatmentPageDentalActDTO[]},
): TreatmentPlanItem {
  return {
    id: item.id,
    clinicId: "clinic_demo",
    patientId: context.patientId,
    actId: context.acts.find((act) => act.name === item.act)?.id ?? item.act,
    actName: item.act,
    price: item.price,
    priority: toDomainPriority(item.priority),
    status: toDomainTreatmentStatus(item.status),
    location: {
      tooth: typeof item.tooth === "number" ? item.tooth : undefined,
      toothIds: item.toothIds,
      mouthRegionId: typeof item.tooth === "string" ? item.tooth : undefined,
      label: getTreatmentLocationLabel(item),
      surfaces: item.surfaces,
      surfacesByTooth: item.surfacesByTooth,
      dentition: toDomainDentition(item.dentition ?? "adult"),
    },
    notes: item.notes,
    treatmentGroupId: item.treatmentGroupId ?? undefined,
    visitProcedureIds: item.visitProcedureIds,
    chargeId: item.chargeId,
    billingStatus: item.billingStatus === "charged" ? "CHARGED" : "NOT_CHARGED",
    createdAt: new Date(item.createdAt),
    createdBy: item.createdBy,
    startedAt: item.startedAt ? new Date(item.startedAt) : undefined,
  };
}

export function fromDomainTreatmentPlanItem(
  item: TreatmentPlanItem,
): TreatmentPageTreatmentPlanItemDTO {
  return {
    id: item.id,
    tooth:
      item.location.tooth ??
      (item.location.toothIds?.length
        ? `${item.location.toothIds.length} teeth`
        : item.location.label),
    toothIds: item.location.toothIds,
    surfaces: item.location.surfaces as TreatmentPageSurfaceCode[],
    surfacesByTooth: item.location.surfacesByTooth as
      | Record<number, TreatmentPageSurfaceCode[]>
      | undefined,
    act: item.actName,
    price: item.price,
    notes: item.notes,
    treatmentGroupId: item.treatmentGroupId ?? null,
    isGroupedTeeth: Boolean(item.location.toothIds?.length),
    dentition: fromDomainDentition(item.location.dentition),
    status: fromDomainTreatmentStatus(item.status),
    priority: fromDomainPriority(item.priority),
    estimatedVisits: 1,
    completedVisits: item.completedAt ? 1 : 0,
    visitProcedureIds: item.visitProcedureIds,
    createdAt: item.createdAt.toISOString(),
    createdBy: item.createdBy,
    startedAt: item.startedAt?.toISOString(),
    billingStatus: item.billingStatus === "CHARGED" ? "charged" : "not_charged",
    chargeId: item.chargeId,
    date: item.createdAt.toISOString().split("T")[0],
  };
}

export const mergeDomainTreatmentPlanItem = (
  current: TreatmentPageTreatmentPlanItemDTO,
  domain: TreatmentPlanItem,
): TreatmentPageTreatmentPlanItemDTO => ({
  ...current,
  ...fromDomainTreatmentPlanItem(domain),
  estimatedVisits: current.estimatedVisits,
  completedVisits:
    domain.status === "COMPLETED"
      ? Math.max(current.completedVisits + 1, current.estimatedVisits)
      : current.completedVisits,
});

export const fromDomainTreatmentGroup = (
  group: TreatmentGroup,
): TreatmentPageTreatmentGroupDTO => ({
  id: group.id,
  patientId: group.patientId,
  label: `${group.actName} — ${group.toothIds.length} teeth`,
  act: group.actName,
  toothIds: group.toothIds,
  billingMode: "package",
  createdAt: group.createdAt.toISOString(),
  createdBy: group.createdBy,
});

export function toDomainVisitProcedure(
  procedure: TreatmentPageVisitProcedureDTO,
  context: {patientId: string; acts: TreatmentPageDentalActDTO[]},
): VisitProcedure {
  return {
    id: procedure.id,
    clinicId: "clinic_demo",
    patientId: context.patientId,
    visitId: procedure.visitId,
    treatmentPlanItemId: procedure.treatmentPlanItemId,
    actId:
      context.acts.find((act) => act.name === procedure.act)?.id ??
      procedure.act,
    actName: procedure.act,
    location: {
      tooth: typeof procedure.tooth === "number" ? procedure.tooth : undefined,
      toothIds: procedure.toothIds,
      mouthRegionId:
        typeof procedure.tooth === "string" ? procedure.tooth : undefined,
      label: getTreatmentLocationLabel(procedure),
      surfaces: procedure.surfaces,
      surfacesByTooth: procedure.surfacesByTooth,
      dentition: toDomainDentition(procedure.dentition ?? "adult"),
    },
    status: procedure.status === "completed" ? "COMPLETED" : "IN_PROGRESS",
    action:
      procedure.action === "completed"
        ? "COMPLETED"
        : procedure.action === "continued"
          ? "CONTINUED"
          : "STARTED",
    notes: procedure.notes,
    performedAt: new Date(procedure.performedAt),
    completedAt: procedure.completedAt
      ? new Date(procedure.completedAt)
      : undefined,
    providerId: procedure.providerId,
  };
}

export function fromDomainVisitProcedure(
  procedure: VisitProcedure,
  acts: TreatmentPageDentalActDTO[],
): TreatmentPageVisitProcedureDTO {
  return {
    id: procedure.id,
    tooth:
      procedure.location.tooth ??
      (procedure.location.toothIds?.length
        ? `${procedure.location.toothIds.length} teeth`
        : procedure.location.label),
    toothIds: procedure.location.toothIds,
    surfaces: procedure.location.surfaces as TreatmentPageSurfaceCode[],
    surfacesByTooth: procedure.location.surfacesByTooth as
      | Record<number, TreatmentPageSurfaceCode[]>
      | undefined,
    act: procedure.actName,
    price: acts.find((act) => act.id === procedure.actId)?.price ?? 0,
    notes: procedure.notes,
    dentition: fromDomainDentition(procedure.location.dentition),
    status: procedure.status === "COMPLETED" ? "completed" : "in-progress",
    visitId: procedure.visitId,
    treatmentPlanItemId: procedure.treatmentPlanItemId,
    action:
      procedure.action === "COMPLETED"
        ? "completed"
        : procedure.action === "CONTINUED"
          ? "continued"
          : "started",
    performedAt: procedure.performedAt.toISOString(),
    providerId: procedure.providerId,
    completedAt: procedure.completedAt?.toISOString(),
  };
}

export const toDomainTreatmentCharge = (
  charge: TreatmentPageTreatmentChargeDTO,
): TreatmentCharge => ({
  id: charge.id,
  clinicId: "clinic_demo",
  patientId: charge.patientId,
  visitId: charge.visitId,
  sourceType: "TREATMENT_PLAN_ITEM",
  sourceId: charge.sourceId,
  label: charge.label,
  locationLabel: charge.location,
  originalAmount: charge.originalAmount,
  paidAmount: charge.paidAmount,
  remainingAmount: charge.remainingAmount,
  status: "UNPAID",
  createdAt: new Date(charge.createdAt),
  createdBy: charge.createdBy,
});

export const fromDomainTreatmentCharge = (
  charge: TreatmentCharge,
): TreatmentPageTreatmentChargeDTO => ({
  id: charge.id,
  patientId: charge.patientId,
  visitId: charge.visitId,
  sourceType: "treatment_plan_item",
  sourceId: charge.sourceId,
  label: charge.label,
  location: charge.locationLabel,
  originalAmount: charge.originalAmount,
  paidAmount: charge.paidAmount,
  remainingAmount: charge.remainingAmount,
  status: "unpaid",
  createdAt: charge.createdAt.toISOString(),
  createdBy: charge.createdBy,
});

export const fromDomainDiagnosis = (
  diagnosis: Diagnosis,
): TreatmentPageDiagnosisDTO => ({
  id: diagnosis.id,
  tooth:
    diagnosis.location.tooth ??
    (diagnosis.location.toothIds?.length
      ? `${diagnosis.location.toothIds.length} teeth`
      : diagnosis.location.label),
  toothIds: diagnosis.location.toothIds,
  surfaces: diagnosis.location.surfaces as TreatmentPageSurfaceCode[],
  surfacesByTooth: diagnosis.location.surfacesByTooth as
    | Record<number, TreatmentPageSurfaceCode[]>
    | undefined,
  diagnosis: diagnosis.diagnosis,
  severity: fromDomainDiagnosisSeverity(diagnosis.severity),
  certainty: fromDomainDiagnosisCertainty(diagnosis.certainty),
  status: fromDomainDiagnosisStatus(diagnosis.status),
  evidence: fromDomainEvidence(diagnosis.evidence),
  attachmentIds: diagnosis.attachmentIds,
  symptoms: diagnosis.symptoms,
  painLevel: diagnosis.painLevel,
  notes: diagnosis.notes,
  date: diagnosis.createdAt.toISOString().split("T")[0],
  dentition: fromDomainDentition(diagnosis.location.dentition),
  isGroupedTeeth: Boolean(diagnosis.location.toothIds?.length),
});

export const toDomainVisitHandoff = (
  handoff: TreatmentPageVisitHandoffDTO,
): VisitHandoff => ({
  id: handoff.id,
  clinicId: "clinic_demo",
  patientId: handoff.patientId,
  visitId: handoff.visitId,
  treatmentPlanItemId: handoff.treatmentPlanItemId,
  text: handoff.text,
  status: toDomainVisitCodingStatus(handoff.status),
  authoredBy: handoff.authoredBy,
  savedAt: new Date(handoff.savedAt),
  codedAt: handoff.codedAt ? new Date(handoff.codedAt) : undefined,
  codedBy: handoff.codedBy,
});

export const fromDomainVisitHandoff = (
  handoff: VisitHandoff,
): TreatmentPageVisitHandoffDTO => ({
  id: handoff.id,
  visitId: handoff.visitId,
  patientId: handoff.patientId,
  treatmentPlanItemId: handoff.treatmentPlanItemId,
  text: handoff.text,
  status: fromDomainVisitCodingStatus(handoff.status),
  authoredBy: handoff.authoredBy,
  savedAt: handoff.savedAt.toISOString(),
  codedAt: handoff.codedAt?.toISOString(),
  codedBy: handoff.codedBy,
});
