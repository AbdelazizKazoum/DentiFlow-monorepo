import { Patient } from "@/domain/patient/entities/patient";
import { IPatientRepository } from "@/domain/patient/repositories/patientRepository";
import type { CreatePatientInput } from "@/domain/patient/commands/CreatePatientInput";

export class CreatePatient {
  constructor(private readonly repository: IPatientRepository) {}

  async execute(input: CreatePatientInput): Promise<Patient> {
    return this.repository.create(input);
  }
}
