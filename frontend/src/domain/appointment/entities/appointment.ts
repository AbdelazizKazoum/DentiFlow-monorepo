export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "NO_SHOW"
  | "COMPLETED";

export type BookingChannel = "ONLINE" | "WALK_IN" | "PHONE";

export interface Appointment {
  id: string;
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
  status: AppointmentStatus;
  notes?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
}
