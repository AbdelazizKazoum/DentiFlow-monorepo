import {ConflictException, Inject, Injectable, NotFoundException} from "@nestjs/common";
import {TreatmentAct} from "../../domain/entities/treatment-act";
import {VisitStatus} from "../../domain/enums/visit-status.enum";
import {
  AddTreatmentActInput,
  ITreatmentActRepository,
  UpdateTreatmentActInput,
} from "../../domain/repositories/treatment-act-repository.interface";
import {IVisitRepository} from "../../domain/repositories/visit-repository.interface";
import {IActCatalogRepository} from "../../domain/repositories/act-catalog-repository.interface";
import {IOutboxRepository} from "../../domain/repositories/outbox-repository.interface";
import {
  ACT_CATALOG_REPOSITORY,
  OUTBOX_REPOSITORY,
  TREATMENT_ACT_REPOSITORY,
  VISIT_REPOSITORY,
} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManageTreatmentActsUseCase {
  constructor(
    @Inject(TREATMENT_ACT_REPOSITORY)
    private readonly treatmentActs: ITreatmentActRepository,
    @Inject(VISIT_REPOSITORY)
    private readonly visits: IVisitRepository,
    @Inject(ACT_CATALOG_REPOSITORY)
    private readonly catalog: IActCatalogRepository,
    @Inject(OUTBOX_REPOSITORY)
    private readonly outbox: IOutboxRepository,
  ) {}

  listByVisit(visitId: string): Promise<TreatmentAct[]> {
    return this.treatmentActs.listByVisit(visitId);
  }

  async getById(id: string): Promise<TreatmentAct> {
    const act = await this.treatmentActs.findById(id);
    if (!act) throw new NotFoundException(`Treatment act "${id}" not found`);
    return act;
  }

  /**
   * unitPrice is a snapshot copied from the act catalog at creation time.
   * Never accept unitPrice from client input and never update it later.
   */
  async add(input: Omit<AddTreatmentActInput, "unitPrice">): Promise<TreatmentAct> {
    await this.assertVisitOpen(input.visitId);
    const catalogItem = await this.catalog.findById(input.actCatalogId);
    if (!catalogItem) {
      throw new NotFoundException(`Act catalog "${input.actCatalogId}" not found`);
    }
    if (!catalogItem.isActive) {
      throw new ConflictException("Act catalog item is inactive");
    }

    const created = await this.treatmentActs.create({
      ...input,
      unitPrice: catalogItem.defaultPrice,
    });
    await this.recalculateTotal(input.visitId);
    await this.outbox.add({
      eventType: "treatment.act.created",
      payload: this.actPayload(created),
    });
    return created;
  }

  async update(id: string, input: UpdateTreatmentActInput): Promise<TreatmentAct> {
    const existing = await this.getById(id);
    await this.assertVisitOpen(existing.visitId);
    const updated = await this.treatmentActs.update(id, input);
    await this.recalculateTotal(updated.visitId);
    await this.outbox.add({
      eventType: "treatment.act.updated",
      payload: this.actPayload(updated),
    });
    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.getById(id);
    await this.assertVisitOpen(existing.visitId);
    await this.treatmentActs.delete(id);
    await this.recalculateTotal(existing.visitId);
    await this.outbox.add({
      eventType: "treatment.act.removed",
      payload: this.actPayload(existing),
    });
  }

  async calculateVisitTotal(visitId: string): Promise<number> {
    return this.treatmentActs.calculateTotal(visitId);
  }

  private async assertVisitOpen(visitId: string): Promise<void> {
    const visit = await this.visits.findById(visitId);
    if (!visit) throw new NotFoundException(`Visit "${visitId}" not found`);
    if (visit.status !== VisitStatus.OPEN) {
      throw new ConflictException("Treatment acts can only mutate on open visits");
    }
  }

  private async recalculateTotal(visitId: string): Promise<void> {
    const total = await this.treatmentActs.calculateTotal(visitId);
    await this.visits.updateTotalAmount(visitId, total);
  }

  private actPayload(act: TreatmentAct): Record<string, unknown> {
    return {
      id: act.id,
      clinic_id: act.clinicId,
      visit_id: act.visitId,
      act_catalog_id: act.actCatalogId,
      quantity: act.quantity,
      unit_price: act.unitPrice,
      status: act.status,
      entered_by: act.enteredBy,
    };
  }
}
