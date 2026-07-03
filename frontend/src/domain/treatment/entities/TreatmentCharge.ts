export interface TreatmentCharge {
  id: string;
  clinicId: string;
  patientId: string;
  visitId: string;
  sourceType: "TREATMENT_PLAN_ITEM";
  sourceId: string;
  label: string;
  locationLabel: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  createdAt: Date;
  createdBy: string;
}
