import type {
  FollowUpRequest,
  MedicalDocumentRequest,
  TreatmentCharge,
  Visit,
  VisitHandoff,
  VisitProcedure,
  VisitStatus,
} from "../entities";

export interface CreateVisitFromQueueInput {
  clinicId: string;
  patientId: string;
  queueEntryId: string;
  appointmentId?: string | null;
  chairId: string;
  providerId: string;
  startedAt?: Date;
}

export interface CloseVisitInput {
  clinicId: string;
  patientId: string;
  visitId: string;
  providerId: string;
  followUpRequest?: Omit<
    FollowUpRequest,
    "id" | "clinicId" | "patientId" | "visitId" | "status" | "requestedAt" | "requestedBy"
  >;
  documentRequest?: Omit<
    MedicalDocumentRequest,
    "id" | "clinicId" | "patientId" | "visitId" | "status" | "requestedAt" | "requestedBy"
  >;
}

export interface CloseVisitResult {
  visit: Visit;
  followUpRequest?: FollowUpRequest;
  documentRequest?: MedicalDocumentRequest;
}

export interface ListVisitsQuery {
  clinicId: string;
  status?: VisitStatus;
  handoffStatus?: VisitHandoff["status"];
  page?: number;
  limit?: number;
}

export interface VisitChargeSummary {
  total: number;
  remaining: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "VOIDED" | "MIXED" | "NONE";
}

export interface TreatmentVisitWorklistItem {
  visit: Visit;
  latestHandoff?: VisitHandoff;
  procedures: VisitProcedure[];
  chargesSummary: VisitChargeSummary;
}

export interface ListVisitsResult {
  visits: TreatmentVisitWorklistItem[];
  total: number;
}

export interface IVisitWorkflowRepository {
  createVisit(input: CreateVisitFromQueueInput): Promise<Visit>;
  listVisits(query: ListVisitsQuery): Promise<ListVisitsResult>;
  findById(id: string): Promise<Visit | null>;
  findActiveByPatient(clinicId: string, patientId: string): Promise<Visit | null>;
  findByQueueEntry(clinicId: string, queueEntryId: string): Promise<Visit | null>;
  updateStatus(visitId: string, status: VisitStatus, changedBy: string): Promise<Visit>;
  saveHandoff(handoff: VisitHandoff): Promise<VisitHandoff>;
  markHandoffCoded(handoffId: string, codedBy: string): Promise<VisitHandoff>;
  closeVisit(input: CloseVisitInput): Promise<Visit>;
  createFollowUpRequest(input: FollowUpRequest): Promise<FollowUpRequest>;
  createDocumentRequest(input: MedicalDocumentRequest): Promise<MedicalDocumentRequest>;
}
