import {PatientDocument} from "../entities/patient-document";
import {DocumentType} from "../enums/document-type.enum";

export interface CreatePatientDocumentInput {
  clinicId: string;
  patientId: string;
  type: DocumentType;
  title?: string;
  fileUrl: string;
}

export interface UpdatePatientDocumentInput {
  type?: DocumentType;
  title?: string | null;
  fileUrl?: string;
}

export interface IPatientDocumentRepository {
  findById(id: string): Promise<PatientDocument | null>;
  create(document: CreatePatientDocumentInput): Promise<PatientDocument>;
  update(
    id: string,
    updates: UpdatePatientDocumentInput,
  ): Promise<PatientDocument>;
  delete(id: string): Promise<void>;
  findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientDocument[]>;
  findByPatientIdAndType(
    clinicId: string,
    patientId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]>;
  findByClinicId(clinicId: string): Promise<PatientDocument[]>;
  findByClinicIdAndType(
    clinicId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]>;
  findMedicalDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]>;
  findInsuranceDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]>;
  findGeneralDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]>;
  searchByTitle(
    clinicId: string,
    searchTerm: string,
    patientId?: string,
  ): Promise<PatientDocument[]>;
  findMultipleByIds(ids: string[]): Promise<PatientDocument[]>;
  deleteMultiple(ids: string[]): Promise<void>;
}
