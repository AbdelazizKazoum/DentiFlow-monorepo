export type QueueStatus = "ARRIVED" | "WAITING" | "IN_CHAIR" | "DONE";
export type QueuePriority = "NORMAL" | "URGENT" | "EMERGENCY";

export interface QueueEntry {
  id: string;
  clinicId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  appointmentType?: string;
  status: QueueStatus;
  priority: QueuePriority;
  notes?: string;
  arrivedAt: Date;
  calledAt?: Date;
  seatedAt?: Date;
  completedAt?: Date;
}
