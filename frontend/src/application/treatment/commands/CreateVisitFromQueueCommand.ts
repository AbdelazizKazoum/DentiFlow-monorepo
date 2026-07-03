export interface CreateVisitFromQueueCommand {
  clinicId: string;
  patientId: string;
  queueEntryId: string;
  appointmentId?: string;
  chairId: string;
  providerId: string;
  startedAt?: Date;
}
