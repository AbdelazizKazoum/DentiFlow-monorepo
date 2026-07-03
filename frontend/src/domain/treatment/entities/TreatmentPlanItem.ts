import type {SurfaceCode} from "./dentalAct";

export type TreatmentStatus =
  | "PROPOSED"
  | "ACCEPTED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED"
  | "VOIDED";

export type TreatmentPriority = "LOW" | "NORMAL" | "HIGH";
export type DentitionMode = "ADULT" | "CHILD" | "MIXED";

export interface TreatmentLocation {
  tooth?: number;
  toothIds?: number[];
  mouthRegionId?: string;
  label: string;
  surfaces: SurfaceCode[];
  surfacesByTooth?: Record<number, SurfaceCode[]>;
  dentition: DentitionMode;
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
}
