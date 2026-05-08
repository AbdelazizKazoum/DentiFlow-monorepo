import {Patient} from "../entities/patient";
import {PatientGender} from "../enums/patient-gender.enum";
import {PatientStatus} from "../enums/patient-status.enum";

export interface ListPatientsQuery {
  clinicId: string;
  page?: number;
  limit?: number;
  status?: PatientStatus;
  gender?: PatientGender;
  search?: string;
  isNew?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: "firstName" | "lastName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface PatientListItem {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: PatientStatus;
  phone: string | null;
  email: string | null;
  dateOfBirth: Date | null;
  gender: PatientGender | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientListResponse {
  items: PatientListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePatientInput {
  clinicId: string;
  firstName: string;
  lastName: string;
  userId?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: PatientGender;
  address?: string;
  notes?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  medicalNotes?: string;
  status?: PatientStatus;
}

export interface UpdatePatientInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  email?: string | null;
  dateOfBirth?: Date | null;
  gender?: PatientGender | null;
  address?: string | null;
  notes?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
  currentMedications?: string | null;
  medicalNotes?: string | null;
  status?: PatientStatus;
}

export interface IPatientRepository {
  findById(id: string): Promise<Patient | null>;
  create(patient: CreatePatientInput): Promise<Patient>;
  update(id: string, updates: UpdatePatientInput): Promise<Patient>;
  delete(id: string): Promise<void>;
  findMany(query: ListPatientsQuery): Promise<PatientListResponse>;
  findByClinicId(clinicId: string): Promise<Patient[]>;
  findActiveByClinicId(clinicId: string): Promise<Patient[]>;
  findByClinicIdAndStatus(
    clinicId: string,
    status: PatientStatus,
  ): Promise<Patient[]>;
  findByUserId(userId: string): Promise<Patient | null>;
  searchByName(
    clinicId: string,
    firstName?: string,
    lastName?: string,
  ): Promise<Patient[]>;
  searchByPhone(clinicId: string, phone: string): Promise<Patient[]>;
  findWithMedicalInfo(clinicId: string): Promise<Patient[]>;
  findNewPatients(clinicId: string, daysThreshold?: number): Promise<Patient[]>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<Patient>;
}
