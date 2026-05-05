import { PatientGender, PatientStatus } from "../entities/patient";

/**
 * Query input for fetching a paginated and filtered list of patients.
 */
export interface GetPatientsQuery {
  /** Clinic to scope the query to */
  clinicId: string;

  // Pagination
  page?: number;
  limit?: number;

  // Filters
  status?: PatientStatus;
  gender?: PatientGender;
  search?: string; // Searches across firstName, lastName, phone, email
  isNew?: boolean; // Filter for new patients (created within last 30 days)

  // Date range filters
  createdFrom?: Date; // Filter patients created on or after this date
  createdTo?: Date; // Filter patients created on or before this date

  // Sorting
  sortBy?: "firstName" | "lastName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}
