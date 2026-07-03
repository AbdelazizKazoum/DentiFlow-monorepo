import type {CreateVisitFromQueueCommand} from "../commands";
import type {VisitWorkflowRepository} from "@/domain/treatment/repositories";

export class CreateVisitFromQueueUseCase {
  constructor(private readonly repository: VisitWorkflowRepository) {}

  async execute(command: CreateVisitFromQueueCommand) {
    const existingForQueue = await this.repository.getVisitByQueueEntry(
      command.clinicId,
      command.queueEntryId,
    );
    if (existingForQueue) return existingForQueue;

    const activeVisit = await this.repository.getActiveVisitByPatient(
      command.clinicId,
      command.patientId,
    );
    if (activeVisit) return activeVisit;

    return this.repository.createVisit(command);
  }
}
