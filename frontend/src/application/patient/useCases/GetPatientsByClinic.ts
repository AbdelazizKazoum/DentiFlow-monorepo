import { Patient } from "@/domain/patient/entities/patient";
import { IPatientRepository } from "@/domain/patient/repositories/patientRepository";

export class GetPatientsByClinic {
  constructor(private readonly repository: IPatientRepository) {}

  async execute(clinicId: string): Promise<Patient[]> {
    return this.repository.findByClinicId(clinicId);
  }
}
