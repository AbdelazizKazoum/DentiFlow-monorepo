import type {SaveVisitHandoffCommand} from "../commands";
import type {VisitHandoff} from "@/domain/treatment/entities";

export class SaveVisitHandoffUseCase {
  execute(
    command: SaveVisitHandoffCommand,
    existing?: VisitHandoff,
    now: Date = new Date(),
  ): VisitHandoff {
    const text = command.text.trim();
    if (!text) throw new Error("Handoff note cannot be empty.");

    return {
      id: existing?.id ?? `handoff_${command.visitId}`,
      clinicId: command.clinicId,
      patientId: command.patientId,
      visitId: command.visitId,
      treatmentPlanItemId: command.treatmentPlanItemId,
      text,
      status: command.status,
      authoredBy: command.providerId,
      savedAt: now,
    };
  }
}
