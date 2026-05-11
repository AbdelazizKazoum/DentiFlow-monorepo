import type {CheckInPatientCommand} from "@/domain/queue/commands/CheckInPatientCommand";
import type {UpdateQueueNotesCommand} from "@/domain/queue/commands/UpdateQueueNotesCommand";
import type {UpdateQueueStatusCommand} from "@/domain/queue/commands/UpdateQueueStatusCommand";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";
import {axiosClient} from "@/infrastructure/http/axiosClient";
import {BaseRepository} from "@/infrastructure/http/BaseRepository";
import type {QueueEntryDTO, QueueEntryListDTO} from "../dtos";
import {checkInCommandToDTO, queueEntryToDomain} from "../mappers";

export class QueueHttpRepository extends BaseRepository implements QueueRepository {
  private getBase(clinicId: string): string {
    return `/api/v1/clinics/${clinicId}/queue`;
  }

  async listByClinic(clinicId: string): Promise<QueueEntry[]> {
    const response = await this.execute(() =>
      axiosClient.get<QueueEntryListDTO>(this.getBase(clinicId)),
    );
    return response.data.queue_entries.map(queueEntryToDomain);
  }

  async getById(id: string): Promise<QueueEntry> {
    const response = await this.execute(() =>
      axiosClient.get<QueueEntryDTO>(`/api/v1/queue/${id}`),
    );
    return queueEntryToDomain(response.data);
  }

  async checkIn(command: CheckInPatientCommand): Promise<QueueEntry> {
    const response = await this.execute(() =>
      axiosClient.post<QueueEntryDTO>(
        this.getBase(command.clinicId),
        checkInCommandToDTO(command),
      ),
    );
    return queueEntryToDomain(response.data);
  }

  async updateStatus(command: UpdateQueueStatusCommand): Promise<QueueEntry> {
    const response = await this.execute(() =>
      axiosClient.patch<QueueEntryDTO>(
        `/api/v1/queue/${command.queueEntryId}/status`,
        {
          status: command.status,
          correction_reason: command.correctionReason,
        },
      ),
    );
    return queueEntryToDomain(response.data);
  }

  async updateNotes(command: UpdateQueueNotesCommand): Promise<QueueEntry> {
    const response = await this.execute(() =>
      axiosClient.patch<QueueEntryDTO>(
        `/api/v1/queue/${command.queueEntryId}/notes`,
        {
          queue_notes: command.notes,
        },
      ),
    );
    return queueEntryToDomain(response.data);
  }
}
