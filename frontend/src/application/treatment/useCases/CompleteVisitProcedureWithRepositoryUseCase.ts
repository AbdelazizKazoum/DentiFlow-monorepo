import type {CompleteVisitProcedureCommand} from "../commands";
import type {TreatmentRepository} from "@/domain/treatment/repositories";
import {CompleteVisitProcedureUseCase} from "./CompleteVisitProcedureUseCase";

export class CompleteVisitProcedureWithRepositoryUseCase {
  private readonly completer = new CompleteVisitProcedureUseCase();

  constructor(private readonly repository: TreatmentRepository) {}

  async execute(command: CompleteVisitProcedureCommand) {
    const workspace = await this.repository.getWorkspace({
      clinicId: command.clinicId,
      patientId: command.patientId ?? "",
    });
    const procedure = workspace.currentSession.find(
      (item) => item.id === command.visitProcedureId,
    );
    if (!procedure) {
      throw new Error(`Visit procedure "${command.visitProcedureId}" not found`);
    }
    const treatmentItem = await this.repository
      .getTreatmentPlanItem(procedure.treatmentPlanItemId)
      .catch(() => undefined);

    const result = this.completer.execute(
      command,
      procedure,
      treatmentItem,
    );

    const updatedProcedure = await this.repository.updateVisitProcedure(
      procedure.id,
      result.procedure,
    );
    const updatedTreatmentItem = result.treatmentItem
      ? await this.repository.updateTreatmentPlanItem(
          result.treatmentItem.id,
          result.treatmentItem,
        )
      : undefined;

    return {procedure: updatedProcedure, treatmentItem: updatedTreatmentItem};
  }
}
