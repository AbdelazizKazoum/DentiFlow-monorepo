import type {
  QueuePriority,
  QueueStatus,
} from "@/domain/queue/entities/queueEntry";

export interface QueueEntryDTO {
  id: string;
  clinic_id: string;
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  doctor_id: string;
  doctor_name: string;
  appointment_type?: string;
  status: QueueStatus;
  priority: QueuePriority;
  queue_notes?: string;
  arrived_at: string;
  called_at?: string;
  seated_at?: string;
  completed_at?: string;
}

export interface QueueEntryListDTO {
  queue_entries: QueueEntryDTO[];
}

export interface CheckInPatientDTO {
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  doctor_id: string;
  doctor_name: string;
  appointment_type?: string;
  priority?: QueuePriority;
  queue_notes?: string;
  arrived_at?: string;
}
