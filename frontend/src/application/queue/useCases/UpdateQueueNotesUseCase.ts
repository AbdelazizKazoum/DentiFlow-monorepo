import type {UpdateQueueNotesCommand} from "@/domain/queue/commands/UpdateQueueNotesCommand";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";

export class UpdateQueueNotesUseCase {
  constructor(private readonly repository: QueueRepository) {}

  async execute(command: UpdateQueueNotesCommand): Promise<QueueEntry> {
    return this.repository.updateNotes(command);
  }
}
