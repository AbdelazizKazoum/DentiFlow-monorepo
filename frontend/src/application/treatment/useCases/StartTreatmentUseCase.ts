import type {StartTreatmentCommand} from "../commands";
import type {
  TreatmentCharge,
  TreatmentPlanItem,
  VisitProcedure,
} from "@/domain/treatment/entities";

export interface StartTreatmentUseCaseInput {
  command: StartTreatmentCommand;
  treatmentItem: TreatmentPlanItem;
  currentSession: VisitProcedure[];
  charges: TreatmentCharge[];
}

export interface StartTreatmentUseCaseResult {
  treatmentItem: TreatmentPlanItem;
  procedure: VisitProcedure;
  charge?: TreatmentCharge;
  reusedExistingProcedure: boolean;
}

export class StartTreatmentUseCase {
  execute(
    input: StartTreatmentUseCaseInput,
    now: Date = new Date(),
  ): StartTreatmentUseCaseResult {
    const existingActiveProcedure = input.currentSession.find(
      (procedure) =>
        procedure.treatmentPlanItemId === input.treatmentItem.id &&
        procedure.visitId === input.command.visitId &&
        procedure.status !== "COMPLETED",
    );

    if (existingActiveProcedure) {
      return {
        treatmentItem: input.treatmentItem,
        procedure: existingActiveProcedure,
        reusedExistingProcedure: true,
      };
    }

    const shouldCharge =
      input.treatmentItem.price > 0 &&
      !input.treatmentItem.chargeId &&
      !input.charges.some(
        (charge) =>
          charge.sourceType === "TREATMENT_PLAN_ITEM" &&
          charge.sourceId === input.treatmentItem.id,
      );
    const newChargeId = `charge_${input.treatmentItem.id}`;
    const chargeId = shouldCharge ? newChargeId : input.treatmentItem.chargeId;

    const treatmentItem: TreatmentPlanItem = {
      ...input.treatmentItem,
      status: "IN_PROGRESS",
      startedAt: input.treatmentItem.startedAt ?? now,
      billingStatus:
        chargeId || input.treatmentItem.billingStatus === "CHARGED"
          ? "CHARGED"
          : "NOT_CHARGED",
      chargeId,
    };

    const procedure: VisitProcedure = {
      id: `vp_${now.getTime()}`,
      clinicId: input.command.clinicId,
      patientId: input.command.patientId,
      visitId: input.command.visitId,
      treatmentPlanItemId: input.treatmentItem.id,
      actId: input.treatmentItem.actId,
      actName: input.treatmentItem.actName,
      location: input.treatmentItem.location,
      status: "IN_PROGRESS",
      action:
        input.treatmentItem.status === "IN_PROGRESS" ? "CONTINUED" : "STARTED",
      notes: input.treatmentItem.notes,
      performedAt: now,
      providerId: input.command.providerId,
    };

    const charge: TreatmentCharge | undefined = shouldCharge
      ? {
          id: newChargeId,
          clinicId: input.command.clinicId,
          patientId: input.command.patientId,
          visitId: input.command.visitId,
          sourceType: "TREATMENT_PLAN_ITEM",
          sourceId: input.treatmentItem.id,
          label: input.treatmentItem.actName,
          locationLabel: input.treatmentItem.location.label,
          originalAmount: input.treatmentItem.price,
          paidAmount: 0,
          remainingAmount: input.treatmentItem.price,
          status: "UNPAID",
          createdAt: now,
          createdBy: input.command.providerId,
        }
      : undefined;

    return {treatmentItem, procedure, charge, reusedExistingProcedure: false};
  }
}
