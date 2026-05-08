import {DocumentType} from "../enums/document-type.enum";

export class PatientDocument {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly patientId: string,
    public readonly type: DocumentType,
    public readonly title: string | null,
    public readonly fileUrl: string,
    public readonly createdAt: Date,
  ) {}
}
