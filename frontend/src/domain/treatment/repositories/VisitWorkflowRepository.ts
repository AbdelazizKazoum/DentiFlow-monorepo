import type {
  FollowUpRequest,
  MedicalDocumentRequest,
  Visit,
  VisitHandoff,
  VisitStatus,
} from "../entities";
import type {
  CloseVisitCommand,
  CreateVisitFromQueueCommand,
} from "@/application/treatment/commands";

export interface VisitWorkflowRepository {
  createVisit(command: CreateVisitFromQueueCommand): Promise<Visit>;
  getActiveVisitByPatient(
    clinicId: string,
    patientId: string,
  ): Promise<Visit | null>;
  getVisitByQueueEntry(
    clinicId: string,
    queueEntryId: string,
  ): Promise<Visit | null>;
  updateVisitStatus(
    visitId: string,
    status: VisitStatus,
    changedBy: string,
  ): Promise<Visit>;
  saveHandoff(handoff: VisitHandoff): Promise<VisitHandoff>;
  markHandoffCoded(handoffId: string, codedBy: string): Promise<VisitHandoff>;
  closeVisit(command: CloseVisitCommand): Promise<void>;
  createFollowUpRequest(request: FollowUpRequest): Promise<FollowUpRequest>;
  createDocumentRequest(
    request: MedicalDocumentRequest,
  ): Promise<MedicalDocumentRequest>;
}
