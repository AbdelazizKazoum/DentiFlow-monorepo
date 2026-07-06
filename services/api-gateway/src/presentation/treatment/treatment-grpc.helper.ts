import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {status as GrpcStatus} from "@grpc/grpc-js";
import {ClientGrpc} from "@nestjs/microservices";
import {TreatmentProto} from "@lib/proto";
import {TREATMENT_GRPC_CLIENT} from "../../infrastructure/grpc/treatment-grpc-client.module";

export const TREATMENT_SERVICE_NAME = TreatmentProto.TREATMENT_SERVICE_NAME;
export type TreatmentServiceClient = TreatmentProto.TreatmentServiceClient;
export {TREATMENT_GRPC_CLIENT};

export function initTreatmentGrpcService(
  grpcClient: ClientGrpc,
): TreatmentServiceClient {
  return grpcClient.getService<TreatmentServiceClient>(TREATMENT_SERVICE_NAME);
}

export function handleGrpcError(err: unknown): never {
  const grpcErr = err as {code?: number; details?: string; message?: string};
  const detail = grpcErr?.details ?? grpcErr?.message;
  if (grpcErr?.code === GrpcStatus.NOT_FOUND) {
    throw new NotFoundException(detail ?? "Not found");
  }
  if (grpcErr?.code === GrpcStatus.ALREADY_EXISTS) {
    throw new ConflictException(detail ?? "Already exists");
  }
  if (grpcErr?.code === GrpcStatus.INVALID_ARGUMENT) {
    throw new BadRequestException(detail ?? "Invalid argument");
  }
  throw new InternalServerErrorException(detail ?? "Treatment service unavailable");
}

const optional = (value: string) => value || undefined;

export const visitToHttp = (dto: TreatmentProto.VisitReply) => ({
  id: dto.id,
  clinicId: dto.clinicId,
  patientId: dto.patientId,
  queueEntryId: optional(dto.queueEntryId),
  appointmentId: optional(dto.appointmentId),
  chairId: dto.chairId,
  providerId: dto.providerId,
  status: dto.status,
  source: dto.source,
  startedAt: dto.startedAt,
  closedAt: optional(dto.closedAt),
  cancelledAt: optional(dto.cancelledAt),
  cancellationReason: optional(dto.cancellationReason),
});

const locationToHttp = (dto?: TreatmentProto.TreatmentLocationMessage) => ({
  tooth: dto?.tooth,
  toothIds: dto?.toothIds?.length ? dto.toothIds : undefined,
  mouthRegionId: optional(dto?.mouthRegionId ?? ""),
  label: dto?.label ?? "",
  surfaces: dto?.surfaces ?? [],
  surfacesByTooth: dto?.surfacesByToothJson
    ? JSON.parse(dto.surfacesByToothJson)
    : undefined,
  dentition: dto?.dentition ?? "ADULT",
});

export const actToHttp = (dto: TreatmentProto.TreatmentActReply) => ({
  id: dto.id,
  clinicId: optional(dto.clinicId),
  name: dto.name,
  category: dto.category,
  price: dto.price,
  groupableTeeth: dto.groupableTeeth,
  affectsTooth: dto.affectsTooth,
  visualType: optional(dto.visualType),
  defaultSurfaces: dto.defaultSurfaces,
  active: dto.active,
});

export const planItemToHttp = (dto: TreatmentProto.TreatmentPlanItemReply) => ({
  id: dto.id,
  clinicId: dto.clinicId,
  patientId: dto.patientId,
  actId: dto.actId,
  actName: dto.actName,
  price: dto.price,
  priority: dto.priority,
  status: dto.status,
  location: locationToHttp(dto.location),
  notes: optional(dto.notes),
  treatmentGroupId: optional(dto.treatmentGroupId),
  visitProcedureIds: dto.visitProcedureIds,
  chargeId: optional(dto.chargeId),
  billingStatus: dto.billingStatus,
  createdAt: dto.createdAt,
  createdBy: dto.createdBy,
  startedAt: optional(dto.startedAt),
  completedAt: optional(dto.completedAt),
  cancelledAt: optional(dto.cancelledAt),
  cancellationReason: optional(dto.cancellationReason),
  voidedAt: optional(dto.voidedAt),
  voidReason: optional(dto.voidReason),
});

export const procedureToHttp = (dto: TreatmentProto.VisitProcedureReply) => ({
  id: dto.id,
  clinicId: dto.clinicId,
  patientId: dto.patientId,
  visitId: dto.visitId,
  treatmentPlanItemId: dto.treatmentPlanItemId,
  actId: dto.actId,
  actName: dto.actName,
  location: locationToHttp(dto.location),
  status: dto.status,
  action: dto.action,
  notes: optional(dto.notes),
  performedAt: dto.performedAt,
  completedAt: optional(dto.completedAt),
  providerId: dto.providerId,
});

export const diagnosisToHttp = (dto: TreatmentProto.DiagnosisReply) => ({
  id: dto.id,
  clinicId: dto.clinicId,
  patientId: dto.patientId,
  diagnosis: dto.diagnosis,
  location: locationToHttp(dto.location),
  severity: dto.severity,
  certainty: dto.certainty,
  status: dto.status,
  evidence: dto.evidence,
  attachmentIds: dto.attachmentIds,
  symptoms: dto.symptoms,
  painLevel: dto.painLevel,
  notes: optional(dto.notes),
  createdAt: dto.createdAt,
  createdBy: dto.createdBy,
});

export const attachmentToHttp = (dto: TreatmentProto.ClinicalAttachmentReply) => ({
  id: dto.id,
  clinicId: dto.clinicId,
  patientId: dto.patientId,
  visitId: optional(dto.visitId),
  type: dto.type,
  title: dto.title,
  fileName: dto.fileName,
  mimeType: dto.mimeType,
  fileUrl: dto.fileUrl,
  uploadedAt: dto.uploadedAt,
  uploadedBy: dto.uploadedBy,
});

export const chargeToHttp = (dto: TreatmentProto.TreatmentChargeReply) => ({
  id: dto.id,
  clinicId: dto.clinicId,
  patientId: dto.patientId,
  visitId: dto.visitId,
  sourceType: dto.sourceType,
  sourceId: dto.sourceId,
  label: dto.label,
  locationLabel: dto.locationLabel,
  originalAmount: dto.originalAmount,
  paidAmount: dto.paidAmount,
  remainingAmount: dto.remainingAmount,
  status: dto.status,
  createdAt: dto.createdAt,
  createdBy: dto.createdBy,
});

export const handoffToHttp = (dto: TreatmentProto.VisitHandoffReply) => ({
  id: dto.id,
  clinicId: dto.clinicId,
  patientId: dto.patientId,
  visitId: dto.visitId,
  treatmentPlanItemId: optional(dto.treatmentPlanItemId),
  text: dto.text,
  status: dto.status,
  authoredBy: dto.authoredBy,
  savedAt: dto.savedAt,
  codedAt: optional(dto.codedAt),
  codedBy: optional(dto.codedBy),
});

export const followUpToHttp = (dto: TreatmentProto.FollowUpRequestReply) => ({
  id: dto.id,
  clinicId: dto.clinicId,
  patientId: dto.patientId,
  visitId: dto.visitId,
  treatmentPlanItemId: optional(dto.treatmentPlanItemId),
  reason: optional(dto.reason),
  preferredDate: optional(dto.preferredDate),
  urgency: dto.urgency,
  status: dto.status,
  requestedAt: dto.requestedAt,
  requestedBy: dto.requestedBy,
});

export const documentToHttp = (dto: TreatmentProto.MedicalDocumentRequestReply) => ({
  id: dto.id,
  clinicId: dto.clinicId,
  patientId: dto.patientId,
  visitId: dto.visitId,
  treatmentPlanItemId: optional(dto.treatmentPlanItemId),
  type: dto.type,
  reason: optional(dto.reason),
  status: dto.status,
  requestedAt: dto.requestedAt,
  requestedBy: dto.requestedBy,
});

export const workspaceToHttp = (dto: TreatmentProto.TreatmentWorkspaceReply) => ({
  activeVisit: dto.activeVisit ? visitToHttp(dto.activeVisit) : undefined,
  acts: (dto.acts ?? []).map(actToHttp),
  treatmentPlan: (dto.treatmentPlan ?? []).map(planItemToHttp),
  currentSession: (dto.currentSession ?? []).map(procedureToHttp),
  diagnoses: (dto.diagnoses ?? []).map(diagnosisToHttp),
  attachments: (dto.attachments ?? []).map(attachmentToHttp),
  charges: (dto.charges ?? []).map(chargeToHttp),
  handoffs: (dto.handoffs ?? []).map(handoffToHttp),
  followUpRequests: (dto.followUpRequests ?? []).map(followUpToHttp),
  documentRequests: (dto.documentRequests ?? []).map(documentToHttp),
});
