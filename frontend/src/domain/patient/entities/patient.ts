/** Patient lifecycle status */
export enum PatientStatus {
  ACTIVE = "ACTIVE", // Patient is actively receiving care
  INACTIVE = "INACTIVE", // Patient is temporarily inactive
  ARCHIVED = "ARCHIVED", // Patient record is archived (soft-deleted)
}

/** Patient gender options */
export enum PatientGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

/**
 * Domain entity representing a patient in the dental clinic system.
 * Contains demographic information, contact details, medical history,
 * and lifecycle management. Patients can be walk-in (no user account)
 * or registered users with online access.
 */
export class Patient {
  constructor(
    /** Unique identifier for the patient */
    public readonly id: string,
    /** Clinic this patient belongs to */
    public readonly clinicId: string,
    /** Patient's first name */
    public readonly firstName: string,
    /** Patient's last name */
    public readonly lastName: string,
    /** When the patient record was created */
    public readonly createdAt: Date,
    /** When the patient record was last updated */
    public readonly updatedAt: Date,
    /** Current status of the patient record */
    public readonly status: PatientStatus = PatientStatus.ACTIVE,
    /** Optional link to auth user account (NULL for walk-in patients) */
    public readonly userId?: string,
    /** Contact phone number for notifications */
    public readonly phone?: string,
    /** Contact email for notifications (different from login email) */
    public readonly email?: string,
    /** Patient's date of birth */
    public readonly dateOfBirth?: Date,
    /** Patient's gender */
    public readonly gender?: PatientGender,
    /** Patient's residential address */
    public readonly address?: string,
    /** Administrative notes (non-medical) */
    public readonly notes?: string,
    /** Known allergies (medical info) */
    public readonly allergies?: string,
    /** Chronic medical conditions */
    public readonly chronicConditions?: string,
    /** Current medications */
    public readonly currentMedications?: string,
    /** Additional medical notes from doctors */
    public readonly medicalNotes?: string,
    /** Soft delete timestamp (NULL if not deleted) */
    public readonly deletedAt?: Date,
    /** Canadian National Identity Number (CNIE) */
    public readonly cnie?: string,
  ) {}

  /** Computed property for patient's full name */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /** Checks if patient is in active status */
  isActive(): boolean {
    return this.status === PatientStatus.ACTIVE;
  }

  /** Checks if patient record is archived */
  isArchived(): boolean {
    return this.status === PatientStatus.ARCHIVED;
  }

  /** Checks if patient has any medical information recorded */
  hasMedicalInfo(): boolean {
    return !!(
      this.allergies ||
      this.chronicConditions ||
      this.currentMedications ||
      this.medicalNotes
    );
  }

  /**
   * Checks if this is considered a "new" patient.
   * A patient is considered new if they were created within the last 30 days.
   * @returns true if the patient was created within the last 30 days
   */
  isNewPatient(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.createdAt >= thirtyDaysAgo;
  }
}
