import { DocumentType } from "../entities/patientDocument";

/**
 * Input data for updating an existing patient document.
 * All fields are optional to allow partial updates.
 */
export interface UpdatePatientDocumentInput {
  type?: DocumentType;
  title?: string;
  fileUrl?: string;
}
