import { DocumentType } from "../entities/patientDocument";

/**
 * Input data for creating a new patient document.
 * Associates a document with a patient for record-keeping purposes.
 */
export interface CreatePatientDocumentInput {
  clinicId: string;
  patientId: string;
  type: DocumentType;
  title?: string;
  fileUrl: string;
}
