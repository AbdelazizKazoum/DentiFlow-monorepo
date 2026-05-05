import { PatientGender, PatientStatus } from "@domain/patient/entities/patient";

export interface PatientDTO {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  status: PatientStatus;
  userId?: string;
  cnie?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  address?: string;
  notes?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  medicalNotes?: string;
  deletedAt?: string;
}

export interface PatientListItemDTO {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: PatientStatus;
  cnie?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  createdAt: string;
  updatedAt: string;
}

export interface PatientListResponseDTO {
  items: PatientListItemDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePatientDTO {
  clinicId: string;
  firstName: string;
  lastName: string;
  userId?: string;
  cnie?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  address?: string;
  notes?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  medicalNotes?: string;
  status?: PatientStatus;
}

export interface UpdatePatientDTO {
  firstName?: string;
  lastName?: string;
  cnie?: string | null;
  phone?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: PatientGender | null;
  address?: string | null;
  notes?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
  currentMedications?: string | null;
  medicalNotes?: string | null;
  status?: PatientStatus;
}
