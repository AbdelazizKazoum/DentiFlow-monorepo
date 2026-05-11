import type {QueueStatus} from "@/domain/queue/entities/queueEntry";

export interface UpdateQueueStatusCommand {
  queueEntryId: string;
  status: QueueStatus;
  correctionReason?: string;
}
