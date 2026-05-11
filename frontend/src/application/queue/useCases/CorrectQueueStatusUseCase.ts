import type {UpdateQueueStatusCommand} from "@/domain/queue/commands/UpdateQueueStatusCommand";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";
import {isBackwardStatusMove} from "@/domain/queue/services/queuePolicy";

export class CorrectQueueStatusUseCase {
  constructor(private readonly repository: QueueRepository) {}

  async execute(command: UpdateQueueStatusCommand): Promise<QueueEntry> {
    const current = await this.repository.getById(command.queueEntryId);
    if (!isBackwardStatusMove(current.status, command.status)) {
      return this.repository.updateStatus(command);
    }

    if (!command.correctionReason?.trim()) {
      throw new Error("Correction reason is required.");
    }

    return this.repository.updateStatus(command);
  }
}
