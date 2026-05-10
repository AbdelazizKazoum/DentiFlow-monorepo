import type {
  AppointmentStatus,
  BookingChannel,
} from "@/domain/appointment/entities/appointment";

export interface AppointmentDTO {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  doctor_id: string;
  doctor_name: string;
  start_at: string;
  end_at: string;
  is_emergency: boolean;
  type?: string;
  channel: BookingChannel;
  status: AppointmentStatus;
  notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface AppointmentListDTO {
  appointments: AppointmentDTO[];
  total: number;
}

export type SaveAppointmentDTO = Partial<
  Omit<
    AppointmentDTO,
    "start_at" | "end_at" | "cancelled_at"
  > & {
    start_at: string;
    end_at: string;
    cancelled_at?: string;
  }
>;
