import type {AddDiagnosisCommand} from "../commands";
import type {TreatmentRepository} from "@/domain/treatment/repositories";
import {AddDiagnosisUseCase} from "./AddDiagnosisUseCase";

export class CreateDiagnosisUseCase {
  private readonly creator = new AddDiagnosisUseCase();

  constructor(private readonly repository: TreatmentRepository) {}

  async execute(command: AddDiagnosisCommand) {
    const diagnosis = this.creator.execute(command);
    return this.repository.saveDiagnosis(diagnosis);
  }
}
