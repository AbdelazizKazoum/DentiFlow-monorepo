import { CreatePatientInput } from "../commands/CreatePatientInput";
import { UpdatePatientInput } from "../commands/UpdatePatientInput";
import { GetPatientsQuery } from "../commands/GetPatientsQuery";
import { PatientListResponse } from "../queries/patientQueries";
import { Patient } from "../entities/patient";

/**
 * Repository interface for Patient entity operations.
 * Handles patient data access, search, and lifecycle management.
 */
export interface PatientRepository {
  // Basic CRUD operations
  findById(id: string): Promise<Patient | null>;
  create(patient: CreatePatientInput): Promise<Patient>;
  update(id: string, updates: UpdatePatientInput): Promise<Patient>;
  delete(id: string): Promise<void>;

  // Paginated & filtered list
  findMany(query: GetPatientsQuery): Promise<PatientListResponse>;

  // Clinic-scoped queries
  findByClinicId(clinicId: string): Promise<Patient[]>;
  findActiveByClinicId(clinicId: string): Promise<Patient[]>;
  findByClinicIdAndStatus(
    clinicId: string,
    status: Patient["status"],
  ): Promise<Patient[]>;

  // Search operations
  findByUserId(userId: string): Promise<Patient | null>;
  searchByName(
    clinicId: string,
    firstName?: string,
    lastName?: string,
  ): Promise<Patient[]>;
  searchByPhone(clinicId: string, phone: string): Promise<Patient[]>;

  // Medical information queries
  findWithMedicalInfo(clinicId: string): Promise<Patient[]>;

  // New patient identification
  findNewPatients(clinicId: string, daysThreshold?: number): Promise<Patient[]>;

  // Soft delete operations
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<Patient>;
}
