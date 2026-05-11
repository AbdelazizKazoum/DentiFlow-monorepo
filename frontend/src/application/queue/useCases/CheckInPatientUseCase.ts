import type {CheckInPatientCommand} from "@/domain/queue/commands/CheckInPatientCommand";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";

export class CheckInPatientUseCase {
  constructor(private readonly repository: QueueRepository) {}

  async execute(command: CheckInPatientCommand): Promise<QueueEntry> {
    return this.repository.checkIn(command);
  }
}
