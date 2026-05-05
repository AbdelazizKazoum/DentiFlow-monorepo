/**
 * Represents a document associated with a patient.
 * Used to store various types of patient-related documents like medical records,
 * insurance forms, general documents, etc. Documents are stored externally
 * (e.g., S3, cloud storage) and referenced by URL.
 */
export enum DocumentType {
  GENERAL = "GENERAL", // General patient documents (ID, consent forms, etc.)
  INSURANCE = "INSURANCE", // Insurance-related documents (claims, policies, etc.)
  MEDICAL = "MEDICAL", // Medical records, test results, prescriptions
  OTHER = "OTHER", // Miscellaneous documents
}

/**
 * Domain entity representing a patient document.
 * Immutable value object that encapsulates document metadata and provides
 * business logic methods for document classification.
 */
export class PatientDocument {
  constructor(
    /** Unique identifier for the document */
    public readonly id: string,
    /** Clinic that owns this document */
    public readonly clinicId: string,
    /** Patient this document belongs to */
    public readonly patientId: string,
    /** Type/category of the document */
    public readonly type: DocumentType,
    /** URL to the stored document file */
    public readonly fileUrl: string,
    /** When the document was uploaded */
    public readonly createdAt: Date,
    /** Optional title/description of the document */
    public readonly title?: string,
  ) {}

  /**
   * Checks if this is a medical document.
   * @returns true if the document type is MEDICAL
   */
  isMedicalDocument(): boolean {
    return this.type === DocumentType.MEDICAL;
  }

  /**
   * Checks if this is an insurance-related document.
   * @returns true if the document type is INSURANCE
   */
  isInsuranceDocument(): boolean {
    return this.type === DocumentType.INSURANCE;
  }
}
