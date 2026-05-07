import { IPatientDocumentRepository } from "@/domain/patient/repositories/patientDocumentRepository";

export class DeletePatientDocument {
  constructor(private readonly repository: IPatientDocumentRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
