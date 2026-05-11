import type {QueuePriority} from "@/domain/queue/entities/queueEntry";

export interface CheckInPatientCommand {
  clinicId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  appointmentType?: string;
  priority?: QueuePriority;
  notes?: string;
  arrivedAt?: Date;
}
