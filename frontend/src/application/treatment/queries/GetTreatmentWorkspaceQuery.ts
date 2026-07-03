export interface GetTreatmentWorkspaceQuery {
  clinicId: string;
  patientId: string;
  activeVisitId?: string;
}

export interface GetTreatmentHistoryQuery {
  clinicId: string;
  patientId: string;
  tooth?: number;
  treatmentPlanItemId?: string;
}
