import { PatientGender, PatientStatus } from "../entities/patient";

/**
 * Input data for updating an existing patient record.
 * All fields are optional to allow partial updates.
 */
export interface UpdatePatientInput {
  firstName?: string;
  lastName?: string;
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
