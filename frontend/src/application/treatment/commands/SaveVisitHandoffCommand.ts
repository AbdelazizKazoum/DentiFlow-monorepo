import type {VisitCodingStatus} from "@/domain/treatment/entities";

export interface SaveVisitHandoffCommand {
  clinicId: string;
  patientId: string;
  visitId: string;
  text: string;
  status: VisitCodingStatus;
  providerId: string;
  treatmentPlanItemId?: string;
}
