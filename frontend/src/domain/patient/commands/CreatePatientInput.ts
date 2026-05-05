import { PatientGender, PatientStatus } from "../entities/patient";

/**
 * Input data for creating a new patient record.
 * Contains all required fields for patient creation, excluding system-generated fields.
 */
export interface CreatePatientInput {
  clinicId: string;
  firstName: string;
  lastName: string;
  userId?: string; // Optional for walk-in patients
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
  status?: PatientStatus; // Defaults to ACTIVE
}
