import {TreatmentProto} from "@lib/proto";
import type {
  ClinicalAttachment,
  Diagnosis,
  FollowUpRequest,
  MedicalDocumentRequest,
  TreatmentAct,
  TreatmentCharge,
  TreatmentLocation,
  TreatmentPlanItem,
  Visit,
  VisitHandoff,
  VisitProcedure,
} from "../../domain/entities";
import type {TreatmentWorkspace} from "../../domain/repositories/treatment-repository.interface";
import type {TreatmentVisitWorklistItem} from "../../domain/repositories/visit-workflow-repository.interface";

const iso = (date?: Date) => date?.toISOString() ?? "";

export const parseDate = (value?: string): Date | undefined =>
  value ? new Date(value) : undefined;

export function parseJsonRecord<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function locationToGrpc(location: TreatmentLocation): TreatmentProto.TreatmentLocationMessage {
  return {
    tooth: location.tooth,
    toothIds: location.toothIds ?? [],
    mouthRegionId: location.mouthRegionId,
    label: location.label,
    surfaces: location.surfaces,
    surfacesByToothJson: JSON.stringify(location.surfacesByTooth ?? {}),
    dentition: location.dentition,
  };
}

export function locationFromGrpc(location: TreatmentProto.TreatmentLocationMessage): TreatmentLocation {
  return {
    tooth: location.tooth,
    toothIds: location.toothIds.length ? location.toothIds : undefined,
    mouthRegionId: location.mouthRegionId || undefined,
    label: location.label,
    surfaces: location.surfaces as TreatmentLocation["surfaces"],
    surfacesByTooth: parseJsonRecord(location.surfacesByToothJson, {}),
    dentition: location.dentition as TreatmentLocation["dentition"],
  };
}

export const visitToGrpc = (visit: Visit): TreatmentProto.VisitReply => ({
  id: visit.id,
  clinicId: visit.clinicId,
  patientId: visit.patientId,
  queueEntryId: visit.queueEntryId ?? "",
  appointmentId: visit.appointmentId ?? "",
  chairId: visit.chairId,
  providerId: visit.providerId,
  status: visit.status,
  source: visit.source,
  startedAt: iso(visit.startedAt),
  closedAt: iso(visit.closedAt),
  cancelledAt: iso(visit.cancelledAt),
  cancellationReason: visit.cancellationReason ?? "",
});

export const actToGrpc = (act: TreatmentAct): TreatmentProto.TreatmentActReply => ({
  id: act.id,
  clinicId: act.clinicId ?? "",
  name: act.name,
  category: act.category,
  price: act.price,
  groupableTeeth: act.groupableTeeth,
  affectsTooth: act.affectsTooth,
  visualType: act.visualType ?? "",
  defaultSurfaces: act.defaultSurfaces ?? [],
  active: act.active,
});

export const planItemToGrpc = (item: TreatmentPlanItem): TreatmentProto.TreatmentPlanItemReply => ({
  id: item.id,
  clinicId: item.clinicId,
  patientId: item.patientId,
  actId: item.actId,
  actName: item.actName,
  price: item.price,
  priority: item.priority,
  status: item.status,
  location: locationToGrpc(item.location),
  notes: item.notes ?? "",
  treatmentGroupId: item.treatmentGroupId ?? "",
  visitProcedureIds: item.visitProcedureIds,
  chargeId: item.chargeId ?? "",
  billingStatus: item.billingStatus,
  createdAt: iso(item.createdAt),
  createdBy: item.createdBy,
  startedAt: iso(item.startedAt),
  completedAt: iso(item.completedAt),
  cancelledAt: iso(item.cancelledAt),
  cancellationReason: item.cancellationReason ?? "",
  voidedAt: iso(item.voidedAt),
  voidReason: item.voidReason ?? "",
});

export const procedureToGrpc = (procedure: VisitProcedure): TreatmentProto.VisitProcedureReply => ({
  id: procedure.id,
  clinicId: procedure.clinicId,
  patientId: procedure.patientId,
  visitId: procedure.visitId,
  treatmentPlanItemId: procedure.treatmentPlanItemId,
  actId: procedure.actId,
  actName: procedure.actName,
  location: locationToGrpc(procedure.location),
  status: procedure.status,
  action: procedure.action,
  notes: procedure.notes ?? "",
  performedAt: iso(procedure.performedAt),
  completedAt: iso(procedure.completedAt),
  providerId: procedure.providerId,
});

export const diagnosisToGrpc = (diagnosis: Diagnosis): TreatmentProto.DiagnosisReply => ({
  id: diagnosis.id,
  clinicId: diagnosis.clinicId,
  patientId: diagnosis.patientId,
  diagnosis: diagnosis.diagnosis,
  location: locationToGrpc(diagnosis.location),
  severity: diagnosis.severity,
  certainty: diagnosis.certainty,
  status: diagnosis.status,
  evidence: diagnosis.evidence,
  attachmentIds: diagnosis.attachmentIds,
  symptoms: diagnosis.symptoms,
  painLevel: diagnosis.painLevel,
  notes: diagnosis.notes ?? "",
  createdAt: iso(diagnosis.createdAt),
  createdBy: diagnosis.createdBy,
});

export const attachmentToGrpc = (attachment: ClinicalAttachment): TreatmentProto.ClinicalAttachmentReply => ({
  id: attachment.id,
  clinicId: attachment.clinicId,
  patientId: attachment.patientId,
  visitId: attachment.visitId ?? "",
  type: attachment.type,
  title: attachment.title,
  fileName: attachment.fileName,
  mimeType: attachment.mimeType,
  fileUrl: attachment.fileUrl,
  uploadedAt: iso(attachment.uploadedAt),
  uploadedBy: attachment.uploadedBy,
});

export const attachmentFromGrpc = (attachment: TreatmentProto.ClinicalAttachmentReply): ClinicalAttachment => ({
  id: attachment.id,
  clinicId: attachment.clinicId,
  patientId: attachment.patientId,
  visitId: attachment.visitId || undefined,
  type: attachment.type as ClinicalAttachment["type"],
  title: attachment.title,
  fileName: attachment.fileName,
  mimeType: attachment.mimeType,
  fileUrl: attachment.fileUrl,
  uploadedAt: parseDate(attachment.uploadedAt) ?? new Date(),
  uploadedBy: attachment.uploadedBy,
});

export const chargeToGrpc = (charge: TreatmentCharge): TreatmentProto.TreatmentChargeReply => ({
  id: charge.id,
  clinicId: charge.clinicId,
  patientId: charge.patientId,
  visitId: charge.visitId,
  sourceType: charge.sourceType,
  sourceId: charge.sourceId,
  label: charge.label,
  locationLabel: charge.locationLabel,
  originalAmount: charge.originalAmount,
  paidAmount: charge.paidAmount,
  remainingAmount: charge.remainingAmount,
  status: charge.status,
  createdAt: iso(charge.createdAt),
  createdBy: charge.createdBy,
});

export const handoffToGrpc = (handoff: VisitHandoff): TreatmentProto.VisitHandoffReply => ({
  id: handoff.id,
  clinicId: handoff.clinicId,
  patientId: handoff.patientId,
  visitId: handoff.visitId,
  treatmentPlanItemId: handoff.treatmentPlanItemId ?? "",
  text: handoff.text,
  status: handoff.status,
  authoredBy: handoff.authoredBy,
  savedAt: iso(handoff.savedAt),
  codedAt: iso(handoff.codedAt),
  codedBy: handoff.codedBy ?? "",
});

export const followUpToGrpc = (request: FollowUpRequest): TreatmentProto.FollowUpRequestReply => ({
  id: request.id,
  clinicId: request.clinicId,
  patientId: request.patientId,
  visitId: request.visitId,
  treatmentPlanItemId: request.treatmentPlanItemId ?? "",
  reason: request.reason ?? "",
  preferredDate: iso(request.preferredDate),
  urgency: request.urgency,
  status: request.status,
  requestedAt: iso(request.requestedAt),
  requestedBy: request.requestedBy,
});

export const documentToGrpc = (request: MedicalDocumentRequest): TreatmentProto.MedicalDocumentRequestReply => ({
  id: request.id,
  clinicId: request.clinicId,
  patientId: request.patientId,
  visitId: request.visitId,
  treatmentPlanItemId: request.treatmentPlanItemId ?? "",
  type: request.type,
  reason: request.reason ?? "",
  status: request.status,
  requestedAt: iso(request.requestedAt),
  requestedBy: request.requestedBy,
});

export const workspaceToGrpc = (workspace: TreatmentWorkspace): TreatmentProto.TreatmentWorkspaceReply => ({
  activeVisit: workspace.activeVisit ? visitToGrpc(workspace.activeVisit) : undefined,
  acts: workspace.acts.map(actToGrpc),
  treatmentPlan: workspace.treatmentPlan.map(planItemToGrpc),
  currentSession: workspace.currentSession.map(procedureToGrpc),
  diagnoses: workspace.diagnoses.map(diagnosisToGrpc),
  attachments: workspace.attachments.map(attachmentToGrpc),
  charges: workspace.charges.map(chargeToGrpc),
  handoffs: workspace.handoffs.map(handoffToGrpc),
  followUpRequests: workspace.followUpRequests.map(followUpToGrpc),
  documentRequests: workspace.documentRequests.map(documentToGrpc),
});

export const worklistItemToGrpc = (
  item: TreatmentVisitWorklistItem,
): TreatmentProto.TreatmentVisitWorklistItemReply => ({
  visit: visitToGrpc(item.visit),
  latestHandoff: item.latestHandoff
    ? handoffToGrpc(item.latestHandoff)
    : undefined,
  procedures: item.procedures.map(procedureToGrpc),
  chargesSummary: {
    total: item.chargesSummary.total,
    remaining: item.chargesSummary.remaining,
    status: item.chargesSummary.status,
  },
});
