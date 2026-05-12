import {Patient} from "@/domain/patient/entities/patient";
import {IPatientRepository} from "@/domain/patient/repositories/patientRepository";

export class SearchPatients {
  constructor(
    private readonly patientRepository: IPatientRepository,
    private readonly clinicId: string,
  ) {}

  async execute(query: string): Promise<Patient[]> {
    if (!query.trim()) {
      return [];
    }

    // Use the search functionality from the repository
    // Since the repository has searchByName and searchByPhone,
    // we'll try to intelligently split the query
    const trimmedQuery = query.trim();

    // If it looks like a phone number (contains digits), search by phone
    if (/\d/.test(trimmedQuery)) {
      return await this.patientRepository.searchByPhone(
        this.clinicId,
        trimmedQuery,
      );
    }

    // Otherwise, try to split into first/last name
    const parts = trimmedQuery.split(/\s+/);
    if (parts.length >= 2) {
      return await this.patientRepository.searchByName(
        this.clinicId,
        parts[0],
        parts.slice(1).join(" "),
      );
    }

    // Single name - search as first name
    return await this.patientRepository.searchByName(
      this.clinicId,
      trimmedQuery,
      undefined,
    );
  }
}
