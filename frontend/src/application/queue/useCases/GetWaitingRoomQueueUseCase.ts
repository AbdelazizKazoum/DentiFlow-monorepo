import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";
import {sortQueueEntries} from "@/domain/queue/services/queuePolicy";

export class GetWaitingRoomQueueUseCase {
  constructor(private readonly repository: QueueRepository) {}

  async execute(clinicId: string): Promise<QueueEntry[]> {
    const entries = await this.repository.listByClinic(clinicId);
    return sortQueueEntries(entries);
  }
}
