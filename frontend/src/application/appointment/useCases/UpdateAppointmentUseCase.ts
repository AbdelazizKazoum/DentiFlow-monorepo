import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {AppointmentRepository} from "@/domain/appointment/repositories/AppointmentRepository";

export class UpdateAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(appointment: Appointment): Promise<Appointment> {
    if (appointment.endAt <= appointment.startAt) {
      throw new Error("End time must be after start time.");
    }

    const nearby = await this.repository.getByRange(
      appointment.clinicId,
      appointment.startAt,
      appointment.endAt,
      appointment.doctorId,
    );
    const hasConflict = nearby.some(
      (item) =>
        item.id !== appointment.id &&
        item.status !== "CANCELLED" &&
        appointment.startAt < item.endAt &&
        appointment.endAt > item.startAt,
    );

    if (hasConflict && !appointment.isEmergency) {
      throw new Error("This time slot overlaps with an existing appointment.");
    }

    return this.repository.save(appointment);
  }
}
