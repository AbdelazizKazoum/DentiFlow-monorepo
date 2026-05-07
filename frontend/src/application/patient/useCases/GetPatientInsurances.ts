import { PatientInsurance } from "@/domain/patient/entities/patientInsurance";
import { IPatientInsuranceRepository } from "@/domain/patient/repositories/patientInsuranceRepository";

export class GetPatientInsurances {
  constructor(private readonly repository: IPatientInsuranceRepository) {}

  async execute(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]> {
    return this.repository.findByPatientId(clinicId, patientId);
  }
}
