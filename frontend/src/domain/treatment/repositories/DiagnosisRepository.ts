import type {Diagnosis, TreatmentLocation} from "../entities";

export interface DiagnosisRepository {
  save(diagnosis: Diagnosis): Promise<Diagnosis>;
  getByPatient(clinicId: string, patientId: string): Promise<Diagnosis[]>;
  getByTreatmentLocation(
    clinicId: string,
    patientId: string,
    location: TreatmentLocation,
  ): Promise<Diagnosis[]>;
}
