import { PatientGender, PatientStatus } from "../entities/patient";

/**
 * A lightweight patient item used in list responses.
 */
export interface PatientListItem {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: PatientStatus;
  phone?: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: PatientGender;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Paginated response for patient list queries.
 */
export interface PatientListResponse {
  items: PatientListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
