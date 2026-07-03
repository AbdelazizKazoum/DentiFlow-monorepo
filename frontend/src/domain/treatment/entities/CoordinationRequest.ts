export type DocumentRequestType =
  | "PRESCRIPTION"
  | "MEDICAL_CERTIFICATE"
  | "CLINICAL_REPORT";
export type RequestStatus = "REQUESTED" | "DONE" | "CANCELLED";
export type FollowUpUrgency = "ROUTINE" | "SOON" | "URGENT";

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
