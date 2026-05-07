import { Patient } from "@/domain/patient/entities/patient";
import { IPatientRepository } from "@/domain/patient/repositories/patientRepository";
import type { UpdatePatientInput } from "@/domain/patient/commands/UpdatePatientInput";

export class UpdatePatient {
  constructor(private readonly repository: IPatientRepository) {}

  async execute(id: string, input: UpdatePatientInput): Promise<Patient> {
    return this.repository.update(id, input);
  }
}
