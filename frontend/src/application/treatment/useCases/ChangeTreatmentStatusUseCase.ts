import type {ChangeTreatmentStatusCommand} from "../commands";
import type {TreatmentPlanItem} from "@/domain/treatment/entities";

export class ChangeTreatmentStatusUseCase {
  execute(
    command: ChangeTreatmentStatusCommand,
    treatmentItem: TreatmentPlanItem,
    now: Date = new Date(),
  ): TreatmentPlanItem {
    if (treatmentItem.clinicId !== command.clinicId) {
      throw new Error("Cannot update a treatment from another clinic.");
    }

    return {
      ...treatmentItem,
      status: command.status,
      cancellationReason:
        command.status === "CANCELLED" ? command.reason : undefined,
      cancelledAt: command.status === "CANCELLED" ? now : undefined,
      voidReason: command.status === "VOIDED" ? command.reason : undefined,
      voidedAt: command.status === "VOIDED" ? now : undefined,
    };
  }
}
