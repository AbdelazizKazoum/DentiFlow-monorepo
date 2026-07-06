import type {CreateVisitFromQueueCommand} from "../commands";
import type {VisitWorkflowRepository} from "@/domain/treatment/repositories";

export class CreateVisitFromQueueUseCase {
  constructor(private readonly repository: VisitWorkflowRepository) {}

  async execute(command: CreateVisitFromQueueCommand) {
    return this.repository.createVisit(command);
  }
}
