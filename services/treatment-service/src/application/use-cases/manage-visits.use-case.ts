import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {Visit} from "../../domain/entities/visit";
import {VisitStatus} from "../../domain/enums/visit-status.enum";
import {
  IVisitRepository,
  OpenVisitInput,
} from "../../domain/repositories/visit-repository.interface";
import {ITreatmentActRepository} from "../../domain/repositories/treatment-act-repository.interface";
import {IOutboxRepository} from "../../domain/repositories/outbox-repository.interface";
import {
  OUTBOX_REPOSITORY,
  TREATMENT_ACT_REPOSITORY,
  VISIT_REPOSITORY,
} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManageVisitsUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visits: IVisitRepository,
    @Inject(TREATMENT_ACT_REPOSITORY)
    private readonly treatmentActs: ITreatmentActRepository,
    @Inject(OUTBOX_REPOSITORY)
    private readonly outbox: IOutboxRepository,
  ) {}

  /**
   * Opens or reuses an active visit for an appointment.
   * VOIDED visits are audit records and do not block creating a later real visit.
   */
  async open(input: OpenVisitInput): Promise<Visit> {
    const existing = await this.visits.findActiveByAppointmentId(input.appointmentId);
    if (existing?.status === VisitStatus.OPEN) return existing;
    if (existing) {
      throw new ConflictException("Appointment already has a finalized visit");
    }

    const created = await this.visits.create(input);
    await this.outbox.add({eventType: "visit.opened", payload: this.visitPayload(created)});
    return created;
  }

  async getById(id: string): Promise<Visit> {
    const visit = await this.visits.findById(id);
    if (!visit) throw new NotFoundException(`Visit "${id}" not found`);
    return visit;
  }

  getByAppointment(appointmentId: string): Promise<Visit | null> {
    return this.visits.findActiveByAppointmentId(appointmentId);
  }

  listOpenByClinic(clinicId: string, doctorId?: string): Promise<Visit[]> {
    return this.visits.listOpenByClinic(clinicId, doctorId);
  }

  async assignAssistant(
    visitId: string,
    assistantId: string,
    assistantName: string,
  ): Promise<Visit> {
    const existing = await this.getById(visitId);
    this.assertOpen(existing);
    const updated = await this.visits.assignAssistant(
      visitId,
      assistantId,
      assistantName,
    );
    await this.outbox.add({
      eventType: "visit.assistant.assigned",
      payload: this.visitPayload(updated),
    });
    return updated;
  }

  async confirm(visitId: string, confirmedBy: string): Promise<Visit> {
    const existing = await this.getById(visitId);
    this.assertOpen(existing);
    if (!(await this.treatmentActs.hasDoneAct(visitId))) {
      throw new BadRequestException("Visit must have at least one DONE treatment act");
    }

    const updated = await this.visits.confirm(visitId, confirmedBy);
    await this.outbox.add({
      eventType: "visit.confirmed",
      payload: this.visitPayload(updated),
    });
    return updated;
  }

  async close(visitId: string): Promise<Visit> {
    const existing = await this.getById(visitId);
    if (existing.status !== VisitStatus.CONFIRMED) {
      throw new ConflictException("Only confirmed visits can be closed");
    }
    const updated = await this.visits.close(visitId);
    await this.outbox.add({
      eventType: "visit.closed",
      payload: {...this.visitPayload(updated), closed_at: new Date().toISOString()},
    });
    return updated;
  }

  async void(visitId: string, reason: string): Promise<Visit> {
    if (!reason.trim()) throw new BadRequestException("Void reason is required");
    const existing = await this.getById(visitId);
    this.assertOpen(existing);
    if ((await this.treatmentActs.countByVisit(visitId)) > 0) {
      throw new ConflictException("Cannot void a visit that has treatment acts");
    }

    const updated = await this.visits.void(visitId, reason);
    await this.outbox.add({eventType: "visit.voided", payload: this.visitPayload(updated)});
    return updated;
  }

  private assertOpen(visit: Visit): void {
    if (visit.status !== VisitStatus.OPEN) {
      throw new ConflictException("Visit is not open");
    }
  }

  private visitPayload(visit: Visit): Record<string, unknown> {
    return {
      visit_id: visit.id,
      clinic_id: visit.clinicId,
      appointment_id: visit.appointmentId,
      patient_id: visit.patientId,
      patient_name: visit.patientName,
      doctor_id: visit.doctorId,
      doctor_name: visit.doctorName,
      assistant_id: visit.assistantId ?? undefined,
      assistant_name: visit.assistantName ?? undefined,
      status: visit.status,
      total_amount: visit.totalAmount,
    };
  }
}
