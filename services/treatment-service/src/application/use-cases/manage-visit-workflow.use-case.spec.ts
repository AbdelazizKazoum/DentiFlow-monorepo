import {ManageVisitWorkflowUseCase} from "./manage-visit-workflow.use-case";
import type {IOutboxRepository} from "../../domain/repositories/outbox-repository.interface";
import type {IVisitWorkflowRepository} from "../../domain/repositories/visit-workflow-repository.interface";
import type {Visit} from "../../domain/entities";

const visit: Visit = {
  id: "visit-1",
  clinicId: "clinic-1",
  patientId: "patient-1",
  queueEntryId: "queue-1",
  chairId: "chair-1",
  providerId: "provider-1",
  status: "OPEN",
  source: "QUEUE",
  startedAt: new Date("2026-07-03T00:00:00.000Z"),
};

describe("ManageVisitWorkflowUseCase", () => {
  let visits: jest.Mocked<IVisitWorkflowRepository>;
  let outbox: jest.Mocked<IOutboxRepository>;
  let useCase: ManageVisitWorkflowUseCase;

  beforeEach(() => {
    visits = {
      createVisit: jest.fn(),
      findById: jest.fn(),
      findActiveByPatient: jest.fn(),
      findByQueueEntry: jest.fn(),
      updateStatus: jest.fn(),
      saveHandoff: jest.fn(),
      markHandoffCoded: jest.fn(),
      closeVisit: jest.fn(),
      createFollowUpRequest: jest.fn(),
      createDocumentRequest: jest.fn(),
    };
    outbox = {
      add: jest.fn(),
      findUnpublished: jest.fn(),
      markPublished: jest.fn(),
    };
    useCase = new ManageVisitWorkflowUseCase(visits, outbox);
  });

  it("returns an existing queue visit without creating a duplicate", async () => {
    visits.findByQueueEntry.mockResolvedValue(visit);

    await expect(
      useCase.createVisitFromQueue({
        clinicId: "clinic-1",
        patientId: "patient-1",
        queueEntryId: "queue-1",
        chairId: "chair-1",
        providerId: "provider-1",
      }),
    ).resolves.toBe(visit);

    expect(visits.createVisit).not.toHaveBeenCalled();
    expect(outbox.add).not.toHaveBeenCalled();
  });

  it("creates and publishes when no active visit exists", async () => {
    visits.findByQueueEntry.mockResolvedValue(null);
    visits.findActiveByPatient.mockResolvedValue(null);
    visits.createVisit.mockResolvedValue(visit);

    await expect(
      useCase.createVisitFromQueue({
        clinicId: "clinic-1",
        patientId: "patient-1",
        queueEntryId: "queue-1",
        chairId: "chair-1",
        providerId: "provider-1",
      }),
    ).resolves.toBe(visit);

    expect(visits.createVisit).toHaveBeenCalledTimes(1);
    expect(outbox.add).toHaveBeenCalledWith(
      expect.objectContaining({eventType: "treatment.visit.created"}),
    );
  });
});
