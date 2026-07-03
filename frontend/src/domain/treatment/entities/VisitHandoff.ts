export type VisitCodingStatus =
  | "STRUCTURED"
  | "DRAFT_NOTE"
  | "NEEDS_CODING"
  | "CODED";

export type VisitLifecycleStatus = "OPEN" | "NEEDS_CODING" | "CLOSED";

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
