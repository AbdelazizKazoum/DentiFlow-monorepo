import type {
  AppointmentStatus,
  BookingChannel,
} from "@/domain/appointment/entities/appointment";

export interface CreateAppointmentCommand {
  clinicId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  startAt: Date;
  endAt: Date;
  isEmergency: boolean;
  type?: string;
  channel: BookingChannel;
  status?: AppointmentStatus;
  notes?: string;
}
