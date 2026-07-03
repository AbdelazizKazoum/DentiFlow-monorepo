import type {CloseVisitCommand} from "../commands";
import type {
  FollowUpRequest,
  MedicalDocumentRequest,
} from "@/domain/treatment/entities";

export interface CloseVisitResult {
  followUpRequest?: FollowUpRequest;
  documentRequest?: MedicalDocumentRequest;
}

export class CloseVisitUseCase {
  execute(command: CloseVisitCommand, now: Date = new Date()): CloseVisitResult {
    return {
      followUpRequest: command.followUpRequest
        ? {
            id: `follow_up_${now.getTime()}`,
            clinicId: command.clinicId,
            patientId: command.patientId,
            visitId: command.visitId,
            treatmentPlanItemId: command.followUpRequest.treatmentPlanItemId,
            reason: command.followUpRequest.reason?.trim() || undefined,
            preferredDate: command.followUpRequest.preferredDate,
            urgency: command.followUpRequest.urgency,
            status: "REQUESTED",
            requestedAt: now,
            requestedBy: command.providerId,
          }
        : undefined,
      documentRequest: command.documentRequest
        ? {
            id: `doc_req_${now.getTime()}`,
            clinicId: command.clinicId,
            patientId: command.patientId,
            visitId: command.visitId,
            treatmentPlanItemId: command.documentRequest.treatmentPlanItemId,
            type: command.documentRequest.type,
            reason: command.documentRequest.reason?.trim() || undefined,
            status: "REQUESTED",
            requestedAt: now,
            requestedBy: command.providerId,
          }
        : undefined,
    };
  }
}
