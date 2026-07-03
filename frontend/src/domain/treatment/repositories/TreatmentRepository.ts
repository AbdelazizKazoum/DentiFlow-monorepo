import type {
  ClinicalAttachment,
  Diagnosis,
  FollowUpRequest,
  MedicalDocumentRequest,
  TreatmentCharge,
  TreatmentGroup,
  TreatmentPlanItem,
  Visit,
  VisitHandoff,
  VisitProcedure,
  DentalAct,
} from "../entities";
import type {GetTreatmentWorkspaceQuery} from "@/application/treatment/queries";

export interface TreatmentWorkspace {
  activeVisit?: Visit;
  acts: DentalAct[];
  treatmentPlan: TreatmentPlanItem[];
  currentSession: VisitProcedure[];
  diagnoses: Diagnosis[];
  attachments: ClinicalAttachment[];
  charges: TreatmentCharge[];
  handoffs: VisitHandoff[];
  followUpRequests: FollowUpRequest[];
  documentRequests: MedicalDocumentRequest[];
}

export interface TreatmentRepository {
  getWorkspace(query: GetTreatmentWorkspaceQuery): Promise<TreatmentWorkspace>;
  getTreatmentPlanItem(id: string): Promise<TreatmentPlanItem>;
  saveTreatmentPlanItems(
    items: TreatmentPlanItem[],
  ): Promise<TreatmentPlanItem[]>;
  updateTreatmentPlanItem(
    id: string,
    patch: Partial<TreatmentPlanItem>,
  ): Promise<TreatmentPlanItem>;
  saveTreatmentGroup(group: TreatmentGroup): Promise<TreatmentGroup>;
  saveVisitProcedure(procedure: VisitProcedure): Promise<VisitProcedure>;
  updateVisitProcedure(
    id: string,
    patch: Partial<VisitProcedure>,
  ): Promise<VisitProcedure>;
  saveDiagnosis(diagnosis: Diagnosis): Promise<Diagnosis>;
  saveClinicalAttachments(
    attachments: ClinicalAttachment[],
  ): Promise<ClinicalAttachment[]>;
  saveTreatmentCharge(charge: TreatmentCharge): Promise<TreatmentCharge>;
  saveVisitHandoff(handoff: VisitHandoff): Promise<VisitHandoff>;
  updateVisitHandoff(id: string, patch: Partial<VisitHandoff>): Promise<VisitHandoff>;
  saveFollowUpRequest(request: FollowUpRequest): Promise<FollowUpRequest>;
  saveDocumentRequest(
    request: MedicalDocumentRequest,
  ): Promise<MedicalDocumentRequest>;
}
