import type {CompleteVisitProcedureCommand} from "../commands";
import type {
  TreatmentPlanItem,
  VisitProcedure,
} from "@/domain/treatment/entities";

export interface CompleteVisitProcedureResult {
  procedure: VisitProcedure;
  treatmentItem?: TreatmentPlanItem;
}

export class CompleteVisitProcedureUseCase {
  execute(
    command: CompleteVisitProcedureCommand,
    procedure: VisitProcedure,
    treatmentItem?: TreatmentPlanItem,
    now: Date = new Date(),
  ): CompleteVisitProcedureResult {
    if (procedure.clinicId !== command.clinicId) {
      throw new Error("Cannot complete a procedure from another clinic.");
    }

    const completedProcedure: VisitProcedure = {
      ...procedure,
      status: "COMPLETED",
      action: "COMPLETED",
      completedAt: now,
      providerId: command.providerId,
    };

    if (!treatmentItem) return {procedure: completedProcedure};

    const nextVisitIds = treatmentItem.visitProcedureIds.includes(procedure.id)
      ? treatmentItem.visitProcedureIds
      : [...treatmentItem.visitProcedureIds, procedure.id];

    return {
      procedure: completedProcedure,
      treatmentItem: {
        ...treatmentItem,
        visitProcedureIds: nextVisitIds,
        status: "COMPLETED",
        completedAt: now,
      },
    };
  }
}
