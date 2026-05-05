export interface PatientInsuranceDTO {
  id: string;
  clinicId: string;
  patientId: string;
  insuranceProviderId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  policyNumber?: string;
  memberId?: string;
}

export interface PatientInsuranceListDTO {
  insurances: PatientInsuranceDTO[];
}

export interface CreatePatientInsuranceDTO {
  clinicId: string;
  patientId: string;
  insuranceProviderId: string;
  policyNumber?: string;
  memberId?: string;
  isActive?: boolean;
}

export interface UpdatePatientInsuranceDTO {
  policyNumber?: string | null;
  memberId?: string | null;
  isActive?: boolean;
}
