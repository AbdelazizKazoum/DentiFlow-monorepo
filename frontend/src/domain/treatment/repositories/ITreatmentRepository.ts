import type {ToothTreatment} from "../entities/toothTreatment";

export interface ITreatmentRepository {
  getTreatmentsByPatient(patientId: string): Promise<ToothTreatment[]>;
  saveTreatment(treatment: ToothTreatment): Promise<ToothTreatment>;
  updateTreatment(
    id: string,
    patch: Partial<ToothTreatment>,
  ): Promise<ToothTreatment>;
  deleteTreatment(id: string): Promise<void>;
}
