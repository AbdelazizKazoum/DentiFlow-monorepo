/**
 * Input data for updating an existing insurance provider.
 * All fields are optional to allow partial updates.
 */
export interface UpdateInsuranceProviderInput {
  name?: string;
  code?: string;
  isActive?: boolean;
}
