import type {ConfirmVisitCommand} from "@/domain/treatment/commands/ConfirmVisitCommand";
import type {Visit} from "@/domain/treatment/entities/Visit";
import type {TreatmentActRepository} from "@/domain/treatment/repositories/TreatmentActRepository";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class ConfirmVisitUseCase {
  constructor(
    private readonly visitRepository: VisitRepository,
    private readonly treatmentActRepository: TreatmentActRepository,
  ) {}

  async execute(command: ConfirmVisitCommand): Promise<Visit> {
    const visit = await this.visitRepository.getById(command.visitId);

    if (visit.status === "CLOSED") {
      throw new Error("Closed visits cannot be confirmed again.");
    }

    const acts = await this.treatmentActRepository.getByVisitId(command.visitId);
    const hasDoneAct = acts.some((act) => act.status === "DONE");

    if (!hasDoneAct) {
      throw new Error("At least one completed act is required to confirm.");
    }

    return this.visitRepository.confirm(command.visitId, command.confirmedBy);
  }
}
