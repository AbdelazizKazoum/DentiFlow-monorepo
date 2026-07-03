import type {TreatmentStatus} from "@/domain/treatment/entities";

export interface ChangeTreatmentStatusCommand {
  clinicId: string;
  treatmentPlanItemId: string;
  status: Extract<TreatmentStatus, "CANCELLED" | "VOIDED" | "DECLINED">;
  reason: string;
  providerId: string;
}
