/**
 * Represents an insurance provider/company that offers dental coverage.
 * Used to manage the list of insurance companies that patients can have
 * coverage with. Providers can be activated/deactivated by clinic admins.
 */
export class InsuranceProvider {
  constructor(
    /** Unique identifier for the insurance provider */
    public readonly id: string,
    /** Clinic that manages this provider */
    public readonly clinicId: string,
    /** Name of the insurance provider (e.g., CNSS, AXA) */
    public readonly name: string,
    /** When the provider was created */
    public readonly createdAt: Date,
    /** When the provider was last updated */
    public readonly updatedAt: Date,
    /** Whether this provider is currently active for new patients */
    public readonly isActive: boolean = true,
    /** Optional provider code/identifier */
    public readonly code?: string,
  ) {}

  /** Checks if this insurance provider is currently active */
  isActiveProvider(): boolean {
    return this.isActive;
  }
}
