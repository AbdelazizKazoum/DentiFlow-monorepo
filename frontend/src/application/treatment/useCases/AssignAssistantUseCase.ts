import type {AssignAssistantCommand} from "@/domain/treatment/commands/AssignAssistantCommand";
import type {Visit} from "@/domain/treatment/entities/Visit";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class AssignAssistantUseCase {
  constructor(private readonly visitRepository: VisitRepository) {}

  async execute(command: AssignAssistantCommand): Promise<Visit> {
    const visit = await this.visitRepository.getById(command.visitId);

    if (visit.status !== "OPEN") {
      throw new Error("Only open visits can receive an assistant.");
    }

    return this.visitRepository.assignAssistant(
      command.visitId,
      command.assistantId,
      command.assistantName,
    );
  }
}
