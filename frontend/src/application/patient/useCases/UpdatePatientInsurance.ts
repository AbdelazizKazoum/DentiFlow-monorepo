import { PatientInsurance } from "@/domain/patient/entities/patientInsurance";
import { IPatientInsuranceRepository } from "@/domain/patient/repositories/patientInsuranceRepository";
import type { UpdatePatientInsuranceInput } from "@/domain/patient/commands/UpdatePatientInsuranceInput";

export class UpdatePatientInsurance {
  constructor(private readonly repository: IPatientInsuranceRepository) {}

  async execute(
    id: string,
    input: UpdatePatientInsuranceInput,
  ): Promise<PatientInsurance> {
    return this.repository.update(id, input);
  }
}
