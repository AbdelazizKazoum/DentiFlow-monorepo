import {ConflictException, Inject, Injectable, NotFoundException} from "@nestjs/common";
import {TreatmentPlanItem} from "../../domain/entities/treatment-plan-item";
import {TreatmentActStatus} from "../../domain/enums/treatment-act-status.enum";
import {CreateTreatmentPlanInput, ITreatmentPlanRepository} from "../../domain/repositories/treatment-plan-repository.interface";
import {IVisitRepository} from "../../domain/repositories/visit-repository.interface";
import {IOutboxRepository} from "../../domain/repositories/outbox-repository.interface";
import {OUTBOX_REPOSITORY, TREATMENT_PLAN_REPOSITORY, VISIT_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManageTreatmentPlansUseCase {
  constructor(
    @Inject(TREATMENT_PLAN_REPOSITORY) private readonly plans: ITreatmentPlanRepository,
    @Inject(VISIT_REPOSITORY) private readonly visits: IVisitRepository,
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: IOutboxRepository,
  ) {}

  listByPatient(clinicId: string, patientId: string, includeCancelled?: boolean): Promise<TreatmentPlanItem[]> {
    return this.plans.listByPatient(clinicId, patientId, includeCancelled);
  }

  async create(input: CreateTreatmentPlanInput): Promise<TreatmentPlanItem> {
    const visit = await this.visits.findById(input.createdVisitId);
    if (!visit) throw new NotFoundException(`Visit "${input.createdVisitId}" not found`);
    if (visit.clinicId !== input.clinicId || visit.patientId !== input.patientId) throw new ConflictException("Plan item must belong to its creating visit's clinic and patient");
    const plan = await this.plans.create(input);
    await this.outbox.add({eventType: "treatment.plan.created", payload: this.payload(plan)});
    return plan;
  }

  async changeStatus(id: string, status: TreatmentActStatus, visitId?: string, completedBy?: string): Promise<TreatmentPlanItem> {
    const plan = await this.plans.findById(id);
    if (!plan) throw new NotFoundException(`Treatment plan item "${id}" not found`);
    if (status === TreatmentActStatus.DONE && (!visitId || !completedBy)) throw new ConflictException("A completed plan requires the completing visit and clinician");
    const updated = await this.plans.updateStatus(id, status, status === TreatmentActStatus.DONE ? visitId : null, status === TreatmentActStatus.DONE ? completedBy : null);
    await this.outbox.add({eventType: "treatment.plan.updated", payload: this.payload(updated)});
    return updated;
  }

  private payload(plan: TreatmentPlanItem): Record<string, unknown> {
    return {id: plan.id, clinic_id: plan.clinicId, patient_id: plan.patientId, status: plan.status, created_visit_id: plan.createdVisitId, completed_visit_id: plan.completedVisitId};
  }
}
