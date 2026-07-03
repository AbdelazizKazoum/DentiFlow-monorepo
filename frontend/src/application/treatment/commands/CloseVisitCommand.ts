import type {
  DocumentRequestType,
  FollowUpUrgency,
} from "@/domain/treatment/entities";

export interface CloseVisitCommand {
  clinicId: string;
  patientId: string;
  visitId: string;
  providerId: string;
  followUpRequest?: {
    treatmentPlanItemId?: string;
    reason?: string;
    preferredDate?: Date;
    urgency: FollowUpUrgency;
  };
  documentRequest?: {
    treatmentPlanItemId?: string;
    type: DocumentRequestType;
    reason?: string;
  };
}
