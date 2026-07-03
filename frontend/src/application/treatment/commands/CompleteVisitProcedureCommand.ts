export interface CompleteVisitProcedureCommand {
  clinicId: string;
  patientId?: string;
  visitProcedureId: string;
  providerId: string;
}
