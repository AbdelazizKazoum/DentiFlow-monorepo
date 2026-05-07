import { PatientInsurance } from "@/domain/patient/entities/patientInsurance";
import { IPatientInsuranceRepository } from "@/domain/patient/repositories/patientInsuranceRepository";
import type { CreatePatientInsuranceInput } from "@/domain/patient/commands/CreatePatientInsuranceInput";

export class CreatePatientInsurance {
  constructor(private readonly repository: IPatientInsuranceRepository) {}

  async execute(input: CreatePatientInsuranceInput): Promise<PatientInsurance> {
    return this.repository.create(input);
  }
}
