import type {CreateAppointmentCommand} from "@/domain/appointment/commands/CreateAppointmentCommand";
import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {AppointmentRepository} from "@/domain/appointment/repositories/AppointmentRepository";

export class CreateAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(command: CreateAppointmentCommand): Promise<Appointment> {
    if (command.endAt <= command.startAt) {
      throw new Error("End time must be after start time.");
    }

    const hasConflict = await this.repository.checkConflicts(
      command.doctorId,
      command.startAt,
      command.endAt,
    );

    if (hasConflict && !command.isEmergency) {
      throw new Error("This time slot overlaps with an existing appointment.");
    }

    return this.repository.save({
      ...command,
      status: command.status ?? "PENDING",
    });
  }
}
