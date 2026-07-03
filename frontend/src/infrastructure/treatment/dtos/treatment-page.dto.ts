export type TreatmentPageSurfaceCode = "V" | "P" | "L" | "M" | "D" | "O" | "R";
export type TreatmentPageVisualState = "planned" | "progress" | "completed";
export type TreatmentPageVisualType = "extraction" | "implant" | "crown";
export type TreatmentPageDentitionMode = "adult" | "child" | "mixed";
export type TreatmentPagePriority = "Low" | "Normal" | "High";
export type TreatmentPageStatus =
  | "proposed"
  | "accepted"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "declined"
  | "cancelled"
  | "voided";
export type TreatmentPageProcedureStatus = "in-progress" | "completed";
export type TreatmentPageBillingStatus = "not_charged" | "charged";
export type TreatmentPageVisitCodingStatus =
  | "structured"
  | "draft_note"
  | "needs_coding"
  | "coded";
export type TreatmentPageVisitLifecycleStatus =
  | "open"
  | "needs_coding"
  | "closed";
export type TreatmentPageDiagnosisCertainty =
  | "Suspected"
  | "Confirmed"
  | "Ruled out";
export type TreatmentPageDiagnosisStatus = "Active" | "Resolved" | "Monitoring";
export type TreatmentPageDiagnosisSeverity = "Mild" | "Moderate" | "Severe";
export type TreatmentPageDocumentRequestTypeId =
  | "prescription"
  | "medical_certificate"
  | "clinical_report";
export type TreatmentPageRequestStatus = "requested";
export type TreatmentPageFollowUpUrgency = "Routine" | "Soon" | "Urgent";
export type TreatmentPageMouthRegionId =
  | "whole_mouth"
  | "upper_arch"
  | "lower_arch"
  | "upper_right"
  | "upper_left"
  | "lower_left"
  | "lower_right";

export interface TreatmentPagePatientDTO {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  alerts: string[];
  balance: number;
}

export interface TreatmentPageDentalActDTO {
  id: string;
  name: string;
  category: string;
  price: number;
  groupableTeeth?: boolean;
  visualType?: TreatmentPageVisualType;
}

export interface TreatmentPageMouthRegionOptionDTO {
  id: TreatmentPageMouthRegionId;
  label: string;
  hint: string;
}

export interface TreatmentPageDentitionModeOptionDTO {
  id: TreatmentPageDentitionMode;
  label: string;
}

export interface TreatmentPageActiveVisitDTO {
  id: string;
  patientId: string;
  chairId: string;
  providerId: string;
  status: "open";
  startedAt: string;
}

export interface TreatmentPageTreatmentBaseDTO {
  id: string;
  tooth: number | string;
  toothIds?: number[];
  surfaces: TreatmentPageSurfaceCode[];
  surfacesByTooth?: Record<number, TreatmentPageSurfaceCode[]>;
  act: string;
  price: number;
  notes?: string;
  date?: string;
  treatmentGroupId?: string | null;
  isGroupedTeeth?: boolean;
  dentition?: TreatmentPageDentitionMode;
}

export interface TreatmentPageTreatmentPlanItemDTO
  extends TreatmentPageTreatmentBaseDTO {
  status: TreatmentPageStatus;
  priority: TreatmentPagePriority;
  estimatedVisits: number;
  completedVisits: number;
  visitProcedureIds: string[];
  createdAt: string;
  createdBy: string;
  startedAt?: string;
  billingStatus?: TreatmentPageBillingStatus;
  chargeId?: string;
  statusReason?: string;
  statusChangedAt?: string;
  statusChangedBy?: string;
}

export interface TreatmentPageVisitProcedureDTO
  extends TreatmentPageTreatmentBaseDTO {
  status: TreatmentPageProcedureStatus;
  visitId: string;
  treatmentPlanItemId: string;
  action: "started" | "continued" | "completed";
  performedAt: string;
  providerId: string;
  priority?: TreatmentPagePriority;
  completedAt?: string;
}

export interface TreatmentPageDiagnosisDTO {
  id: string;
  tooth: number | string;
  toothIds?: number[];
  surfaces: TreatmentPageSurfaceCode[];
  surfacesByTooth?: Record<number, TreatmentPageSurfaceCode[]>;
  diagnosis: string;
  severity: TreatmentPageDiagnosisSeverity;
  certainty?: TreatmentPageDiagnosisCertainty;
  status?: TreatmentPageDiagnosisStatus;
  evidence?: string[];
  attachmentIds?: string[];
  symptoms?: string[];
  painLevel?: number;
  notes?: string;
  date: string;
  dentition?: TreatmentPageDentitionMode;
  isGroupedTeeth?: boolean;
}

export interface TreatmentPageClinicalAttachmentDTO {
  id: string;
  type: "radiology";
  title: string;
  fileName: string;
  fileUrl: string;
  visitId: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TreatmentPageVisitHandoffDTO {
  id: string;
  visitId: string;
  patientId: string;
  treatmentPlanItemId?: string;
  text: string;
  status: TreatmentPageVisitCodingStatus;
  authoredBy: string;
  savedAt: string;
  codedAt?: string;
  codedBy?: string;
}

export interface TreatmentPageTreatmentGroupDTO {
  id: string;
  patientId: string;
  label: string;
  act: string;
  toothIds: number[];
  billingMode: "package" | "per_item";
  createdAt: string;
  createdBy: string;
}

export interface TreatmentPageTreatmentChargeDTO {
  id: string;
  patientId: string;
  visitId: string;
  sourceType: "treatment_plan_item";
  sourceId: string;
  label: string;
  location: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "unpaid";
  createdAt: string;
  createdBy: string;
}

export interface TreatmentPageFollowUpRequestDTO {
  id: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId: string;
  reason: string;
  preferredDate: string;
  urgency: TreatmentPageFollowUpUrgency;
  status: TreatmentPageRequestStatus;
  requestedAt: string;
  requestedBy: string;
}

export interface TreatmentPageDocumentRequestDTO {
  id: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId: string;
  type: TreatmentPageDocumentRequestTypeId;
  reason: string;
  status: TreatmentPageRequestStatus;
  source: "visit_close";
  requestedAt: string;
  requestedBy: string;
}
