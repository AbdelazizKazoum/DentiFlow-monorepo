import type {ChangeTreatmentStatusCommand} from "../commands";
import type {TreatmentRepository} from "@/domain/treatment/repositories";
import {ChangeTreatmentStatusUseCase} from "./ChangeTreatmentStatusUseCase";

export class ChangeTreatmentStatusWithRepositoryUseCase {
  private readonly changer = new ChangeTreatmentStatusUseCase();

  constructor(private readonly repository: TreatmentRepository) {}

  async execute(command: ChangeTreatmentStatusCommand) {
    const item = await this.repository.getTreatmentPlanItem(
      command.treatmentPlanItemId,
    );
    const updated = this.changer.execute(command, item);
    return this.repository.updateTreatmentPlanItem(updated.id, updated);
  }
}
