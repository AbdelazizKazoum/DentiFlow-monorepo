import { PatientDocument } from "@/domain/patient/entities/patientDocument";
import { IPatientDocumentRepository } from "@/domain/patient/repositories/patientDocumentRepository";
import type { CreatePatientDocumentInput } from "@/domain/patient/commands/CreatePatientDocumentInput";

export class CreatePatientDocument {
  constructor(private readonly repository: IPatientDocumentRepository) {}

  async execute(input: CreatePatientDocumentInput): Promise<PatientDocument> {
    return this.repository.create(input);
  }
}
