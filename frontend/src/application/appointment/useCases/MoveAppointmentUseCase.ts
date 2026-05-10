import type {MoveAppointmentCommand} from "@/domain/appointment/commands/MoveAppointmentCommand";
import type {AppointmentRepository} from "@/domain/appointment/repositories/AppointmentRepository";

export class MoveAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(command: MoveAppointmentCommand): Promise<void> {
    if (command.newEndAt <= command.newStartAt) {
      throw new Error("End time must be after start time.");
    }

    const appointment = await this.repository.getById(command.appointmentId);
    const visibleAppointments = await this.repository.getByRange(
      appointment.clinicId,
      command.newStartAt,
      command.newEndAt,
      command.doctorId,
    );
    const hasConflict = visibleAppointments.some(
      (item) =>
        item.id !== command.appointmentId &&
        item.status !== "CANCELLED" &&
        command.newStartAt < item.endAt &&
        command.newEndAt > item.startAt,
    );

    if (hasConflict && !appointment.isEmergency) {
      throw new Error("This time slot overlaps with an existing appointment.");
    }

    await this.repository.updateTiming(command);
  }
}
