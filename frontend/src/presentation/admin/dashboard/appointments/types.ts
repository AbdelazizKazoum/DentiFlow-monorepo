export type AppointmentStatus = "confirmed" | "pending" | "cancelled";

export interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  patientName: string;
  service: string;
  notes?: string;
}
