export interface StartTreatmentCommand {
  clinicId: string;
  patientId: string;
  visitId: string;
  treatmentPlanItemId: string;
  providerId: string;
}
