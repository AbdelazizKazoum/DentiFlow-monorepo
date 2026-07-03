export interface TreatmentGroup {
  id: string;
  clinicId: string;
  patientId: string;
  actId: string;
  actName: string;
  toothIds: number[];
  billingMode: "PACKAGE";
  createdAt: Date;
  createdBy: string;
}
