import {CreatePatientInsuranceInput} from "../commands/CreatePatientInsuranceInput";
import {UpdatePatientInsuranceInput} from "../commands/UpdatePatientInsuranceInput";
import {PatientInsurance} from "../entities/patientInsurance";

/**
 * Repository interface for PatientInsurance entity operations.
 * Manages the relationship between patients and their insurance coverage.
 */
export interface IPatientInsuranceRepository {
  // Basic CRUD operations
  findById(id: string): Promise<PatientInsurance | null>;
  create(insurance: CreatePatientInsuranceInput): Promise<PatientInsurance>;
  update(
    id: string,
    updates: UpdatePatientInsuranceInput,
  ): Promise<PatientInsurance>;
  delete(id: string): Promise<void>;

  // Patient-scoped queries
  findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]>;
  findActiveByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]>;

  // Provider-scoped queries
  findByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]>;
  findActiveByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]>;

  // Clinic-scoped queries
  findByClinicId(clinicId: string): Promise<PatientInsurance[]>;
  findActiveByClinicId(clinicId: string): Promise<PatientInsurance[]>;

  // Search operations
  findByPolicyNumber(
    clinicId: string,
    policyNumber: string,
  ): Promise<PatientInsurance[]>;
  findByMemberId(
    clinicId: string,
    memberId: string,
  ): Promise<PatientInsurance[]>;

  // Status management
  activate(id: string): Promise<PatientInsurance>;
  deactivate(id: string): Promise<PatientInsurance>;

  // Bulk operations for patient
  activateAllForPatient(clinicId: string, patientId: string): Promise<void>;
  deactivateAllForPatient(clinicId: string, patientId: string): Promise<void>;
}
