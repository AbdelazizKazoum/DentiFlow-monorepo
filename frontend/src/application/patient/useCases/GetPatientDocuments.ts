import { PatientDocument } from "@/domain/patient/entities/patientDocument";
import { IPatientDocumentRepository } from "@/domain/patient/repositories/patientDocumentRepository";

export class GetPatientDocuments {
  constructor(private readonly repository: IPatientDocumentRepository) {}

  async execute(
    clinicId: string,
    patientId: string,
  ): Promise<PatientDocument[]> {
    return this.repository.findByPatientId(clinicId, patientId);
  }
}
