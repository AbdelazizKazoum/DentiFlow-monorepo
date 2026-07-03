import type {
  ClinicalAttachment,
  Diagnosis,
  FollowUpRequest,
  MedicalDocumentRequest,
  TreatmentAct,
  TreatmentCharge,
  TreatmentGroup,
  TreatmentPlanItem,
  Visit,
  VisitHandoff,
  VisitProcedure,
} from "../entities";

export interface TreatmentWorkspace {
  activeVisit?: Visit;
  acts: TreatmentAct[];
  treatmentPlan: TreatmentPlanItem[];
  currentSession: VisitProcedure[];
  diagnoses: Diagnosis[];
  attachments: ClinicalAttachment[];
  charges: TreatmentCharge[];
  handoffs: VisitHandoff[];
  followUpRequests: FollowUpRequest[];
  documentRequests: MedicalDocumentRequest[];
}

export interface GetTreatmentWorkspaceQuery {
  clinicId: string;
  patientId: string;
  activeVisitId?: string;
}

export interface ITreatmentRepository {
  getWorkspace(query: GetTreatmentWorkspaceQuery): Promise<TreatmentWorkspace>;
  getAct(id: string, clinicId: string): Promise<TreatmentAct | null>;
  getTreatmentPlanItem(id: string): Promise<TreatmentPlanItem | null>;
  saveTreatmentPlanItems(items: TreatmentPlanItem[]): Promise<TreatmentPlanItem[]>;
  updateTreatmentPlanItem(id: string, patch: Partial<TreatmentPlanItem>): Promise<TreatmentPlanItem>;
  saveTreatmentGroup(group: TreatmentGroup): Promise<TreatmentGroup>;
  saveVisitProcedure(procedure: VisitProcedure): Promise<VisitProcedure>;
  updateVisitProcedure(id: string, patch: Partial<VisitProcedure>): Promise<VisitProcedure>;
  getVisitProcedure(id: string): Promise<VisitProcedure | null>;
  saveDiagnosis(diagnosis: Diagnosis): Promise<Diagnosis>;
  saveClinicalAttachments(attachments: ClinicalAttachment[]): Promise<ClinicalAttachment[]>;
  saveTreatmentCharge(charge: TreatmentCharge): Promise<TreatmentCharge>;
}
