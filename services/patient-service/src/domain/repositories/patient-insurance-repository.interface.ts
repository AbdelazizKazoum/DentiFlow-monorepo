import {PatientInsurance} from "../entities/patient-insurance";

export interface CreatePatientInsuranceInput {
  clinicId: string;
  patientId: string;
  insuranceProviderId: string;
  policyNumber?: string;
  memberId?: string;
  isActive?: boolean;
}

export interface UpdatePatientInsuranceInput {
  policyNumber?: string | null;
  memberId?: string | null;
  isActive?: boolean;
}

export interface IPatientInsuranceRepository {
  findById(id: string): Promise<PatientInsurance | null>;
  create(insurance: CreatePatientInsuranceInput): Promise<PatientInsurance>;
  update(
    id: string,
    updates: UpdatePatientInsuranceInput,
  ): Promise<PatientInsurance>;
  delete(id: string): Promise<void>;
  findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]>;
  findActiveByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]>;
  findByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]>;
  findActiveByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]>;
  findByClinicId(clinicId: string): Promise<PatientInsurance[]>;
  findActiveByClinicId(clinicId: string): Promise<PatientInsurance[]>;
  findByPolicyNumber(
    clinicId: string,
    policyNumber: string,
  ): Promise<PatientInsurance[]>;
  findByMemberId(
    clinicId: string,
    memberId: string,
  ): Promise<PatientInsurance[]>;
  activate(id: string): Promise<PatientInsurance>;
  deactivate(id: string): Promise<PatientInsurance>;
  activateAllForPatient(clinicId: string, patientId: string): Promise<void>;
  deactivateAllForPatient(clinicId: string, patientId: string): Promise<void>;
}
