import type {
  AppointmentStatus,
  BookingChannel,
} from "@/domain/appointment/entities/appointment";

export interface AppointmentFormState {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  startAt: string;
  endAt: string;
  isEmergency: boolean;
  type: string;
  channel: BookingChannel;
  status: AppointmentStatus;
  notes: string;
}
