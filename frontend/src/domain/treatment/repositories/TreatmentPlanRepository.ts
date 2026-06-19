import type {TreatmentPlanItem} from "../entities/TreatmentPlanItem";

export interface TreatmentPlanRepository {
  getByPatient(clinicId: string, patientId: string, includeCancelled?: boolean): Promise<TreatmentPlanItem[]>;
  create(item: Partial<TreatmentPlanItem>): Promise<TreatmentPlanItem>;
}
