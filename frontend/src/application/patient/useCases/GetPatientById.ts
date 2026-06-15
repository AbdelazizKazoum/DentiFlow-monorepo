import type {Patient} from "@/domain/patient/entities/patient";
import type {IPatientRepository} from "@/domain/patient/repositories/patientRepository";

export class GetPatientById {
  constructor(private readonly repository: IPatientRepository) {}

  async execute(id: string): Promise<Patient | null> {
    if (!id) {
      throw new Error("A patient id is required.");
    }

    return this.repository.findById(id);
  }
}
