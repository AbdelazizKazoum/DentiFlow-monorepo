import { IPatientInsuranceRepository } from "@/domain/patient/repositories/patientInsuranceRepository";

export class DeletePatientInsurance {
  constructor(private readonly repository: IPatientInsuranceRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
