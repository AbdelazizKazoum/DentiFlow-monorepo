import type {UpdateQueueStatusCommand} from "@/domain/queue/commands/UpdateQueueStatusCommand";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";
import {isBackwardStatusMove} from "@/domain/queue/services/queuePolicy";

export class UpdateQueueStatusUseCase {
  constructor(private readonly repository: QueueRepository) {}

  async execute(command: UpdateQueueStatusCommand): Promise<QueueEntry> {
    const current = await this.repository.getById(command.queueEntryId);
    if (isBackwardStatusMove(current.status, command.status)) {
      throw new Error("A correction reason is required to move status backward.");
    }

    return this.repository.updateStatus(command);
  }
}
