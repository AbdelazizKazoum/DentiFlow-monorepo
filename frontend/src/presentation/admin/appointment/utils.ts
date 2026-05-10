import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {AppointmentFormState} from "./types";

export function toDatetimeLocal(date: string | Date): string {
  const value = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
    value.getDate(),
  )}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function makeEmptyAppointmentForm(
  doctorId: string,
  doctorName: string,
): AppointmentFormState {
  const now = new Date();
  now.setSeconds(0, 0);
  const later = new Date(now.getTime() + 30 * 60_000);

  return {
    id: "",
    patientId: "",
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    doctorId,
    doctorName,
    startAt: toDatetimeLocal(now),
    endAt: toDatetimeLocal(later),
    isEmergency: false,
    type: "",
    channel: "PHONE",
    status: "PENDING",
    notes: "",
  };
}

export function appointmentToForm(
  appointment: Appointment,
): AppointmentFormState {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    patientPhone: appointment.patientPhone ?? "",
    patientEmail: "",
    doctorId: appointment.doctorId,
    doctorName: appointment.doctorName,
    startAt: toDatetimeLocal(appointment.startAt),
    endAt: toDatetimeLocal(appointment.endAt),
    isEmergency: appointment.isEmergency,
    type: appointment.type ?? "",
    channel: appointment.channel,
    status: appointment.status,
    notes: appointment.notes ?? "",
  };
}
