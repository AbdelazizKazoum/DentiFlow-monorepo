import type {GetPatientsQuery} from "@/domain/patient/commands/GetPatientsQuery";
import type {PatientListResponse} from "@/domain/patient/queries/patientQueries";
import {IPatientRepository} from "@/domain/patient/repositories/patientRepository";

export class GetPatientsByClinic {
  constructor(private readonly repository: IPatientRepository) {}

  async execute(query: GetPatientsQuery): Promise<PatientListResponse> {
    return this.repository.findMany(query);
  }
}
