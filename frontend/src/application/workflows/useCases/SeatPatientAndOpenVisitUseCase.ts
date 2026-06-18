import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {QueueRepository} from "@/domain/queue/repositories/QueueRepository";
import type {Visit} from "@/domain/treatment/entities/Visit";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export interface SeatPatientAndOpenVisitResult {
  queueEntry: QueueEntry;
  visit: Visit;
}

export class SeatPatientAndOpenVisitUseCase {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly visitRepository: VisitRepository,
  ) {}

  /**
   * Seat a patient and ensure there is exactly one active OPEN visit.
   * Repeated IN_CHAIR actions reuse the existing OPEN visit instead of creating
   * duplicate clinical encounters for the same appointment.
   */
  async execute(queueEntryId: string): Promise<SeatPatientAndOpenVisitResult> {
    const current = await this.queueRepository.getById(queueEntryId);
    const existingVisit = await this.visitRepository.getByAppointmentId(
      current.appointmentId,
    );

    if (
      existingVisit?.status === "CONFIRMED" ||
      existingVisit?.status === "CLOSED"
    ) {
      throw new Error("This appointment already has a finalized visit.");
    }

    const queueEntry = await this.queueRepository.updateStatus({
      queueEntryId,
      status: "IN_CHAIR",
    });

    if (existingVisit?.status === "OPEN") {
      return {queueEntry, visit: existingVisit};
    }

    const visit = await this.visitRepository.save({
      appointmentId: queueEntry.appointmentId,
      clinicId: queueEntry.clinicId,
      patientId: queueEntry.patientId,
      patientName: queueEntry.patientName,
      doctorId: queueEntry.doctorId,
      doctorName: queueEntry.doctorName,
      status: "OPEN",
      totalAmount: 0,
    });

    return {queueEntry, visit};
  }
}
