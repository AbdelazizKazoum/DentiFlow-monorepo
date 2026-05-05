/**
 * Input data for creating a new insurance provider.
 * Contains all required fields for insurance provider creation.
 */
export interface CreateInsuranceProviderInput {
  clinicId: string;
  name: string;
  code?: string;
  isActive?: boolean; // Defaults to true
}
