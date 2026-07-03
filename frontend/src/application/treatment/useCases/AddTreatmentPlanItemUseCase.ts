import type {AddTreatmentPlanItemCommand} from "../commands";
import type {
  DentalAct,
  TreatmentGroup,
  TreatmentPlanItem,
} from "@/domain/treatment/entities";
import {buildTreatmentLocation} from "@/domain/treatment/services";

export interface AddTreatmentPlanItemResult {
  items: TreatmentPlanItem[];
  group?: TreatmentGroup;
}

export class AddTreatmentPlanItemUseCase {
  execute(
    command: AddTreatmentPlanItemCommand,
    act: DentalAct,
    now: Date = new Date(),
  ): AddTreatmentPlanItemResult {
    const hasRegionTarget =
      Boolean(command.mouthRegionId) || command.selectedTeeth.length === 0;
    const shouldGroup =
      !hasRegionTarget && command.selectedTeeth.length > 1 && act.groupableTeeth;
    const groupId = `group_${now.getTime()}`;

    const base = {
      clinicId: command.clinicId,
      patientId: command.patientId,
      actId: act.id,
      actName: act.name,
      price: act.price,
      priority: command.priority,
      status: "PROPOSED" as const,
      notes: command.notes?.trim() || undefined,
      treatmentGroupId: shouldGroup ? groupId : undefined,
      visitProcedureIds: [],
      billingStatus: "NOT_CHARGED" as const,
      createdAt: now,
      createdBy: command.providerId,
    };

    if (hasRegionTarget || shouldGroup) {
      const location = buildTreatmentLocation(command);
      const items: TreatmentPlanItem[] = [
        {
          ...base,
          id: shouldGroup
            ? `act_${now.getTime()}_group`
            : `act_${now.getTime()}_gen`,
          location,
        },
      ];

      const group: TreatmentGroup | undefined = shouldGroup
        ? {
            id: groupId,
            clinicId: command.clinicId,
            patientId: command.patientId,
            actId: act.id,
            actName: act.name,
            toothIds: command.selectedTeeth,
            billingMode: "PACKAGE",
            createdAt: now,
            createdBy: command.providerId,
          }
        : undefined;

      return {items, group};
    }

    return {
      items: command.selectedTeeth.map((tooth) => ({
        ...base,
        id: `act_${now.getTime()}_${tooth}`,
        treatmentGroupId: undefined,
        location: buildTreatmentLocation({
          ...command,
          selectedTeeth: [tooth],
        }),
      })),
    };
  }
}
