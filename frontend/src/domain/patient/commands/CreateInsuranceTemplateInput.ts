/**
 * Input data for creating a new insurance template.
 * Contains all required fields for insurance template creation.
 */
export interface CreateInsuranceTemplateInput {
  insuranceProviderId: string;
  name: string;
  fileUrl: string;
}
