/**
 * Represents a patient's insurance coverage with a specific provider.
 * Used to track which insurance providers a patient has coverage with,
 * including policy numbers and member IDs. This information is used for
 * billing, claims processing, and insurance verification during treatment.
 */
export class PatientInsurance {
  constructor(
    /** Unique identifier for this insurance record */
    public readonly id: string,
    /** Clinic that manages this insurance record */
    public readonly clinicId: string,
    /** Patient who has this insurance coverage */
    public readonly patientId: string,
    /** Insurance provider offering the coverage */
    public readonly insuranceProviderId: string,
    /** When this insurance record was created */
    public readonly createdAt: Date,
    /** When this insurance record was last updated */
    public readonly updatedAt: Date,
    /** Whether this insurance is currently active */
    public readonly isActive: boolean = true,
    /** Policy number from the insurance provider */
    public readonly policyNumber?: string,
    /** Member ID for the insured person */
    public readonly memberId?: string,
  ) {}

  /**
   * Checks if this insurance coverage is currently active.
   * @returns true if the insurance is active
   */
  isActiveInsurance(): boolean {
    return this.isActive;
  }

  /**
   * Checks if a policy number is available.
   * @returns true if policy number is provided
   */
  hasPolicyNumber(): boolean {
    return !!this.policyNumber;
  }

  /**
   * Checks if a member ID is available.
   * @returns true if member ID is provided
   */
  hasMemberId(): boolean {
    return !!this.memberId;
  }
}
