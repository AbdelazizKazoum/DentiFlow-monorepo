import type {CheckInPatientCommand} from "@/domain/queue/commands/CheckInPatientCommand";
import type {UpdateQueueNotesCommand} from "@/domain/queue/commands/UpdateQueueNotesCommand";
import type {UpdateQueueStatusCommand} from "@/domain/queue/commands/UpdateQueueStatusCommand";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";

export interface QueueRepository {
  listByClinic(clinicId: string): Promise<QueueEntry[]>;
  getById(id: string): Promise<QueueEntry>;
  checkIn(command: CheckInPatientCommand): Promise<QueueEntry>;
  updateStatus(command: UpdateQueueStatusCommand): Promise<QueueEntry>;
  updateNotes(command: UpdateQueueNotesCommand): Promise<QueueEntry>;
}
