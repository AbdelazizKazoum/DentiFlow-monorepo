/**
 * Represents a template/form provided by an insurance provider.
 * Used to store standardized forms like reimbursement forms, claim forms, etc.
 * that patients need to fill out for their insurance claims. Templates are
 * managed by clinic administrators and linked to specific insurance providers.
 */
export class InsuranceTemplate {
  constructor(
    /** Unique identifier for the template */
    public readonly id: string,
    /** Insurance provider this template belongs to */
    public readonly insuranceProviderId: string,
    /** Display name of the template (e.g., "Reimbursement Form") */
    public readonly name: string,
    /** URL to the template file stored externally */
    public readonly fileUrl: string,
    /** When the template was created/uploaded */
    public readonly createdAt: Date,
  ) {}

  /**
   * Extracts the filename from the file URL.
   * @returns the filename or 'template' as fallback
   */
  getFileName(): string {
    return this.fileUrl.split("/").pop() || "template";
  }
}
