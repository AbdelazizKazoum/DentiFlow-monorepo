/**
 * Input data for creating a new patient insurance record.
 * Links a patient to their insurance coverage with a specific provider.
 */
export interface CreatePatientInsuranceInput {
  clinicId: string;
  patientId: string;
  insuranceProviderId: string;
  policyNumber?: string;
  memberId?: string;
  isActive?: boolean; // Defaults to true
}
