import { IPatientRepository } from "@/domain/patient/repositories/patientRepository";

export class DeletePatient {
  constructor(private readonly repository: IPatientRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
