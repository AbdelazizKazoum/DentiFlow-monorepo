import type {TreatmentLocation} from "./TreatmentPlanItem";

export type VisitProcedureStatus = "IN_PROGRESS" | "COMPLETED";
export type VisitProcedureAction = "STARTED" | "CONTINUED" | "COMPLETED";

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
