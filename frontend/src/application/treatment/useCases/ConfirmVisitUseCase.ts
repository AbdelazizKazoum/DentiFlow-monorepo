import type {ConfirmVisitCommand} from "@/domain/treatment/commands/ConfirmVisitCommand";
import type {Visit} from "@/domain/treatment/entities/Visit";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class ConfirmVisitUseCase {
  constructor(
    private readonly visitRepository: VisitRepository,
  ) {}

  async execute(command: ConfirmVisitCommand): Promise<Visit> {
    const visit = await this.visitRepository.getById(command.visitId);

    if (visit.status === "CLOSED") {
      throw new Error("Closed visits cannot be confirmed again.");
    }

    return this.visitRepository.confirm(command.visitId, command.confirmedBy);
  }
}
