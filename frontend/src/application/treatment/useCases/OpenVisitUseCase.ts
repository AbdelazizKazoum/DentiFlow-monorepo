import type {OpenVisitCommand} from "@/domain/treatment/commands/OpenVisitCommand";
import type {Visit} from "@/domain/treatment/entities/Visit";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class OpenVisitUseCase {
  constructor(private readonly visitRepository: VisitRepository) {}

  async execute(command: OpenVisitCommand): Promise<Visit> {
    const existing = await this.visitRepository.getByAppointmentId(
      command.appointmentId,
    );

    if (existing?.status === "OPEN") {
      return existing;
    }

    if (existing?.status === "CONFIRMED" || existing?.status === "CLOSED") {
      throw new Error("This appointment already has a finalized visit.");
    }

    return this.visitRepository.save({
      ...command,
      status: "OPEN",
      totalAmount: 0,
    });
  }
}
