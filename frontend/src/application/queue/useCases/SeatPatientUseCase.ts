import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";

export class SeatPatientUseCase {
  constructor(private readonly repository: QueueRepository) {}

  async execute(queueEntryId: string): Promise<QueueEntry> {
    return this.repository.updateStatus({
      queueEntryId,
      status: "IN_CHAIR",
    });
  }
}
