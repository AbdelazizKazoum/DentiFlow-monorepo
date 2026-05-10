export interface MoveAppointmentCommand {
  appointmentId: string;
  doctorId: string;
  doctorName?: string;
  newStartAt: Date;
  newEndAt: Date;
}
