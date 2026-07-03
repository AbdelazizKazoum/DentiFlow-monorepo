export type SurfaceCode = "V" | "P" | "L" | "M" | "D" | "O" | "R";
export type ActVisualType =
  | "filling"
  | "root_canal"
  | "crown"
  | "extraction"
  | "implant"
  | "graft";
export type ActCategory =
  | "GENERAL"
  | "RADIOGRAPHY"
  | "PREVENTIVE"
  | "RESTORATIVE"
  | "ENDODONTICS"
  | "SURGERY"
  | "PROSTHETICS"
  | "AESTHETIC"
  | "ORTHODONTICS";
export type DentitionMode = "ADULT" | "CHILD" | "MIXED";
export type TreatmentPriority = "LOW" | "NORMAL" | "HIGH";
export type TreatmentStatus =
  | "PROPOSED"
  | "ACCEPTED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED"
  | "VOIDED";
export type VisitStatus = "OPEN" | "NEEDS_CODING" | "CLOSED" | "CANCELLED";
export type VisitSource = "QUEUE" | "DIRECT";
export type VisitProcedureStatus = "IN_PROGRESS" | "COMPLETED";
export type VisitProcedureAction = "STARTED" | "CONTINUED" | "COMPLETED";
export type DiagnosisSeverity = "MILD" | "MODERATE" | "SEVERE";
export type DiagnosisCertainty = "SUSPECTED" | "CONFIRMED" | "RULED_OUT";
export type DiagnosisStatus = "ACTIVE" | "RESOLVED" | "MONITORING";
export type DiagnosisEvidence =
  | "VISUAL_EXAM"
  | "X_RAY"
  | "PERCUSSION_TEST"
  | "COLD_TEST"
  | "PERIODONTAL_PROBING";
export type ClinicalAttachmentType = "RADIOLOGY" | "PHOTO" | "DOCUMENT";
export type VisitCodingStatus =
  | "STRUCTURED"
  | "DRAFT_NOTE"
  | "NEEDS_CODING"
  | "CODED";
export type DocumentRequestType =
  | "PRESCRIPTION"
  | "MEDICAL_CERTIFICATE"
  | "CLINICAL_REPORT";
export type FollowUpUrgency = "ROUTINE" | "SOON" | "URGENT";
export type RequestStatus = "REQUESTED" | "DONE" | "CANCELLED";

export interface TreatmentLocation {
  tooth?: number;
  toothIds?: number[];
  mouthRegionId?: string;
  label: string;
  surfaces: SurfaceCode[];
  surfacesByTooth?: Record<number, SurfaceCode[]>;
  dentition: DentitionMode;
}

export interface TreatmentAct {
  id: string;
  clinicId?: string | null;
  name: string;
  category: ActCategory;
  price: number;
  groupableTeeth: boolean;
  affectsTooth: boolean;
  visualType?: ActVisualType;
  defaultSurfaces?: SurfaceCode[];
  active: boolean;
}

export interface Visit {
  id: string;
  clinicId: string;
  patientId: string;
  queueEntryId?: string;
  appointmentId?: string;
  chairId: string;
  providerId: string;
  status: VisitStatus;
  source: VisitSource;
  startedAt: Date;
  closedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface TreatmentGroup {
  id: string;
  clinicId: string;
  patientId: string;
  actId: string;
  actName: string;
  toothIds: number[];
  billingMode: "PACKAGE" | "PER_ITEM";
  createdAt: Date;
  createdBy: string;
}

export interface TreatmentPlanItem {
  id: string;
  clinicId: string;
  patientId: string;
  actId: string;
  actName: string;
  price: number;
  priority: TreatmentPriority;
  status: TreatmentStatus;
  location: TreatmentLocation;
  notes?: string;
  treatmentGroupId?: string;
  visitProcedureIds: string[];
  chargeId?: string;
  billingStatus: "NOT_CHARGED" | "CHARGED";
  createdAt: Date;
  createdBy: string;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  voidedAt?: Date;
  voidReason?: string;
  statusChangedAt?: Date;
  statusChangedBy?: string;
}

export interface VisitProcedure {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId: string;
  actId: string;
  actName: string;
  location: TreatmentLocation;
  status: VisitProcedureStatus;
  action: VisitProcedureAction;
  notes?: string;
  performedAt: Date;
  completedAt?: Date;
  providerId: string;
}

export interface Diagnosis {
  id: string;
  clinicId: string;
  patientId: string;
  diagnosis: string;
  location: TreatmentLocation;
  severity: DiagnosisSeverity;
  certainty: DiagnosisCertainty;
  status: DiagnosisStatus;
  evidence: DiagnosisEvidence[];
  attachmentIds: string[];
  symptoms: string[];
  painLevel: number;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface ClinicalAttachment {
  id: string;
  clinicId: string;
  patientId: string;
  visitId?: string;
  type: ClinicalAttachmentType;
  title: string;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface VisitHandoff {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId?: string;
  text: string;
  status: VisitCodingStatus;
  authoredBy: string;
  savedAt: Date;
  codedAt?: Date;
  codedBy?: string;
}

export interface TreatmentCharge {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  sourceType: "TREATMENT_PLAN_ITEM" | "VISIT_PROCEDURE" | "OTHER";
  sourceId: string;
  label: string;
  locationLabel: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "VOIDED";
  createdAt: Date;
  createdBy: string;
}

export interface FollowUpRequest {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId?: string;
  reason?: string;
  preferredDate?: Date;
  urgency: FollowUpUrgency;
  status: RequestStatus;
  requestedAt: Date;
  requestedBy: string;
}

export interface MedicalDocumentRequest {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId?: string;
  type: DocumentRequestType;
  reason?: string;
  status: RequestStatus;
  requestedAt: Date;
  requestedBy: string;
}
