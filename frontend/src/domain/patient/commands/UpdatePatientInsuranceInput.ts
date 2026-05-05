/**
 * Input data for updating an existing patient insurance record.
 * All fields are optional to allow partial updates.
 */
export interface UpdatePatientInsuranceInput {
  policyNumber?: string;
  memberId?: string;
  isActive?: boolean;
}
