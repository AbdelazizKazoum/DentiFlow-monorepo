export type VisitStatus = "OPEN" | "NEEDS_CODING" | "CLOSED" | "CANCELLED";
export type VisitSource = "QUEUE" | "DIRECT";

export interface Visit {
  id: string;
  clinicId: string;
  patientId: string;
  queueEntryId?: string;
  appointmentId?: string;
  chairId: string;
  providerId: string;
  status: VisitStatus;
  source: VisitSource;
  startedAt: Date;
  closedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}
