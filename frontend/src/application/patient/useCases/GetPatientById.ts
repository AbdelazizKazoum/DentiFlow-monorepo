import type {Patient} from "@/domain/patient/entities/patient";
import type {IPatientRepository} from "@/domain/patient/repositories/patientRepository";

export class GetPatientById {
  constructor(private readonly repository: IPatientRepository) {}

  async execute(id: string): Promise<Patient | null> {
    return this.repository.findById(id);
  }
}
