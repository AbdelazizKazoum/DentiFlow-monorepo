import { CreatePatientDocumentInput } from "../commands/CreatePatientDocumentInput";
import { UpdatePatientDocumentInput } from "../commands/UpdatePatientDocumentInput";
import { PatientDocument, DocumentType } from "../entities/patientDocument";

/**
 * Repository interface for PatientDocument entity operations.
 * Manages documents associated with patients (medical records, insurance forms, etc.).
 */
export interface PatientDocumentRepository {
  // Basic CRUD operations
  findById(id: string): Promise<PatientDocument | null>;
  create(document: CreatePatientDocumentInput): Promise<PatientDocument>;
  update(
    id: string,
    updates: UpdatePatientDocumentInput,
  ): Promise<PatientDocument>;
  delete(id: string): Promise<void>;

  // Patient-scoped queries
  findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientDocument[]>;
  findByPatientIdAndType(
    clinicId: string,
    patientId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]>;

  // Clinic-scoped queries
  findByClinicId(clinicId: string): Promise<PatientDocument[]>;
  findByClinicIdAndType(
    clinicId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]>;

  // Type-based queries
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

  // Search operations
  searchByTitle(
    clinicId: string,
    searchTerm: string,
    patientId?: string,
  ): Promise<PatientDocument[]>;

  // Bulk operations
  findMultipleByIds(ids: string[]): Promise<PatientDocument[]>;
  deleteMultiple(ids: string[]): Promise<void>;
}
