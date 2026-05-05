import { DocumentType } from "@domain/patient/entities/patientDocument";

export interface PatientDocumentDTO {
  id: string;
  clinicId: string;
  patientId: string;
  type: DocumentType;
  fileUrl: string;
  createdAt: string;
  title?: string;
}

export interface PatientDocumentListDTO {
  documents: PatientDocumentDTO[];
}

export interface CreatePatientDocumentDTO {
  clinicId: string;
  patientId: string;
  type: DocumentType;
  fileUrl: string;
  title?: string;
}

export interface UpdatePatientDocumentDTO {
  type?: DocumentType;
  title?: string | null;
  fileUrl?: string;
}
