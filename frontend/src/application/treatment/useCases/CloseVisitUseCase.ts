import type {CloseVisitCommand} from "@/domain/treatment/commands/CloseVisitCommand";
import type {Visit} from "@/domain/treatment/entities/Visit";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class CloseVisitUseCase {
  constructor(private readonly visitRepository: VisitRepository) {}

  async execute(command: CloseVisitCommand): Promise<Visit> {
    const visit = await this.visitRepository.getById(command.visitId);

    if (visit.status !== "CONFIRMED") {
      throw new Error("Only confirmed visits can be closed.");
    }

    return this.visitRepository.close(command.visitId);
  }
}
