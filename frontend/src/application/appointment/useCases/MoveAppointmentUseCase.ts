import type {MoveAppointmentCommand} from "@/domain/appointment/commands/MoveAppointmentCommand";
import type {AppointmentRepository} from "@/domain/appointment/repositories/AppointmentRepository";
import {isBlockingOverlap} from "@/domain/appointment/services/appointmentConflictPolicy";

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
        isBlockingOverlap(item, command.newStartAt, command.newEndAt),
    );

    if (hasConflict && !appointment.isEmergency) {
      throw new Error("This time slot overlaps with an existing appointment.");
    }

    await this.repository.updateTiming(command);
  }
}
