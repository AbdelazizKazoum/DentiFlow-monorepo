import {BadRequestException, Inject, Injectable, NotFoundException} from "@nestjs/common";
import {randomUUID} from "crypto";
import type {FollowUpRequest, MedicalDocumentRequest, Visit, VisitHandoff} from "../../domain/entities";
import {
  CloseVisitInput,
  CloseVisitResult,
  CreateVisitFromQueueInput,
  IVisitWorkflowRepository,
  ListVisitsQuery,
  ListVisitsResult,
} from "../../domain/repositories/visit-workflow-repository.interface";
import {IOutboxRepository} from "../../domain/repositories/outbox-repository.interface";
import {
  OUTBOX_REPOSITORY,
  VISIT_WORKFLOW_REPOSITORY,
} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManageVisitWorkflowUseCase {
  constructor(
    @Inject(VISIT_WORKFLOW_REPOSITORY)
    private readonly visits: IVisitWorkflowRepository,
    @Inject(OUTBOX_REPOSITORY)
    private readonly outbox: IOutboxRepository,
  ) {}

  async createVisitFromQueue(input: CreateVisitFromQueueInput): Promise<Visit> {
    const existingForQueue = await this.visits.findByQueueEntry(
      input.clinicId,
      input.queueEntryId,
    );
    if (existingForQueue) return existingForQueue;

    const activeForPatient = await this.visits.findActiveByPatient(
      input.clinicId,
      input.patientId,
    );
    if (activeForPatient) return activeForPatient;

    const visit = await this.visits.createVisit(input);
    await this.outbox.add({
      eventType: "treatment.visit.created",
      payload: this.visitPayload(visit),
    });
    return visit;
  }

  async getVisit(id: string): Promise<Visit> {
    const visit = await this.visits.findById(id);
    if (!visit) throw new NotFoundException(`Visit "${id}" not found`);
    return visit;
  }

  listVisits(query: ListVisitsQuery): Promise<ListVisitsResult> {
    return this.visits.listVisits(query);
  }

  async saveVisitHandoff(input: {
    clinicId: string;
    patientId: string;
    visitId: string;
    text: string;
    status: VisitHandoff["status"];
    providerId: string;
    treatmentPlanItemId?: string;
  }): Promise<VisitHandoff> {
    const text = input.text.trim();
    if (!text) throw new BadRequestException("Handoff note cannot be empty");
    const handoff = await this.visits.saveHandoff({
      id: randomUUID(),
      clinicId: input.clinicId,
      patientId: input.patientId,
      visitId: input.visitId,
      treatmentPlanItemId: input.treatmentPlanItemId,
      text,
      status: input.status,
      authoredBy: input.providerId,
      savedAt: new Date(),
    });
    if (handoff.status === "NEEDS_CODING") {
      await this.visits.updateStatus(handoff.visitId, "NEEDS_CODING", input.providerId);
    }
    return handoff;
  }

  async markHandoffCoded(handoffId: string, codedBy: string): Promise<VisitHandoff> {
    const handoff = await this.visits.markHandoffCoded(handoffId, codedBy);
    const visit = await this.visits.findById(handoff.visitId);
    if (visit?.status === "NEEDS_CODING") {
      await this.visits.updateStatus(visit.id, "OPEN", codedBy);
    }
    return handoff;
  }

  async closeVisit(input: CloseVisitInput): Promise<CloseVisitResult> {
    const visit = await this.visits.findById(input.visitId);
    if (!visit) throw new NotFoundException(`Visit "${input.visitId}" not found`);
    if (!["OPEN", "NEEDS_CODING"].includes(visit.status)) {
      throw new BadRequestException("Only open visits can be closed");
    }

    const now = new Date();
    const [followUpRequest, documentRequest] = await Promise.all([
      input.followUpRequest
        ? this.visits.createFollowUpRequest({
            id: randomUUID(),
            clinicId: input.clinicId,
            patientId: input.patientId,
            visitId: input.visitId,
            treatmentPlanItemId: input.followUpRequest.treatmentPlanItemId,
            reason: input.followUpRequest.reason?.trim() || undefined,
            preferredDate: input.followUpRequest.preferredDate,
            urgency: input.followUpRequest.urgency,
            status: "REQUESTED",
            requestedAt: now,
            requestedBy: input.providerId,
          } satisfies FollowUpRequest)
        : Promise.resolve(undefined),
      input.documentRequest
        ? this.visits.createDocumentRequest({
            id: randomUUID(),
            clinicId: input.clinicId,
            patientId: input.patientId,
            visitId: input.visitId,
            treatmentPlanItemId: input.documentRequest.treatmentPlanItemId,
            type: input.documentRequest.type,
            reason: input.documentRequest.reason?.trim() || undefined,
            status: "REQUESTED",
            requestedAt: now,
            requestedBy: input.providerId,
          } satisfies MedicalDocumentRequest)
        : Promise.resolve(undefined),
    ]);

    const closed = await this.visits.closeVisit(input);
    await this.outbox.add({
      eventType: "treatment.visit.closed",
      payload: this.visitPayload(closed),
    });
    return {visit: closed, followUpRequest, documentRequest};
  }

  private visitPayload(visit: Visit): Record<string, unknown> {
    return {
      id: visit.id,
      clinic_id: visit.clinicId,
      patient_id: visit.patientId,
      queue_entry_id: visit.queueEntryId,
      appointment_id: visit.appointmentId,
      status: visit.status,
      source: visit.source,
      started_at: visit.startedAt.toISOString(),
      closed_at: visit.closedAt?.toISOString(),
    };
  }
}
