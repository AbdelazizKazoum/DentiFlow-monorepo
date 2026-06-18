import type {UpdateQueueStatusCommand} from "@/domain/queue/commands/UpdateQueueStatusCommand";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";
import {isBackwardStatusMove} from "@/domain/queue/services/queuePolicy";
import type {TreatmentActRepository} from "@/domain/treatment/repositories/TreatmentActRepository";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class CorrectQueueStatusWithVisitUseCase {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly visitRepository: VisitRepository,
    private readonly treatmentActRepository: TreatmentActRepository,
  ) {}

  /**
   * Correct queue status while preserving treatment audit rules.
   * If a patient was seated by mistake and no acts were recorded, the open visit
   * is voided. If acts exist, the correction is blocked for clinical review.
   */
  async execute(command: UpdateQueueStatusCommand): Promise<QueueEntry> {
    const current = await this.queueRepository.getById(command.queueEntryId);
    if (isBackwardStatusMove(current.status, command.status)) {
      this.assertCorrectionReason(command.correctionReason);
    }

    const visitToOpen = await this.getVisitToOpen(command, current);
    const visitToVoid = await this.getVoidableVisit(command, current);
    const updated = await this.queueRepository.updateStatus(command);

    if (visitToOpen === "CREATE") {
      await this.visitRepository.save({
        appointmentId: updated.appointmentId,
        clinicId: updated.clinicId,
        patientId: updated.patientId,
        patientName: updated.patientName,
        doctorId: updated.doctorId,
        doctorName: updated.doctorName,
        status: "OPEN",
        totalAmount: 0,
      });
    }

    if (visitToVoid) {
      await this.visitRepository.void(
        visitToVoid.id,
        command.correctionReason ?? "Queue status corrected away from chair.",
      );
    }

    return updated;
  }

  private assertCorrectionReason(reason: string | undefined) {
    if (!reason?.trim()) {
      throw new Error("Correction reason is required.");
    }
  }

  private async getVisitToOpen(
    command: UpdateQueueStatusCommand,
    current: QueueEntry,
  ): Promise<"CREATE" | null> {
    if (command.status !== "IN_CHAIR") {
      return null;
    }

    const existingVisit = await this.visitRepository.getByAppointmentId(
      current.appointmentId,
    );

    if (existingVisit?.status === "OPEN") {
      return null;
    }

    if (
      existingVisit?.status === "CONFIRMED" ||
      existingVisit?.status === "CLOSED"
    ) {
      throw new Error("This appointment already has a finalized visit.");
    }

    return "CREATE";
  }

  private async getVoidableVisit(
    command: UpdateQueueStatusCommand,
    current: QueueEntry,
  ) {
    if (current.status !== "IN_CHAIR" || command.status === "IN_CHAIR") {
      return null;
    }

    const visit = await this.visitRepository.getByAppointmentId(
      current.appointmentId,
    );

    if (!visit || visit.status !== "OPEN") {
      return null;
    }

    const acts = await this.treatmentActRepository.getByVisitId(visit.id);

    if (acts.length > 0) {
      throw new Error(
        "This visit already has treatment acts. Review the visit before correcting chair status.",
      );
    }

    return visit;
  }
}
