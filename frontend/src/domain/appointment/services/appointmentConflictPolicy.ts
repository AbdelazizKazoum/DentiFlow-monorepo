import type {Appointment} from "@/domain/appointment/entities/appointment";

export function isBlockingAppointment(appointment: Appointment): boolean {
  return appointment.status !== "CANCELLED";
}

export function appointmentsOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean {
  return firstStart < secondEnd && firstEnd > secondStart;
}

export function isBlockingOverlap(
  appointment: Appointment,
  start: Date,
  end: Date,
): boolean {
  return (
    isBlockingAppointment(appointment) &&
    appointmentsOverlap(start, end, appointment.startAt, appointment.endAt)
  );
}
