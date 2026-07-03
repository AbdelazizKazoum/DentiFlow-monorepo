import type {TreatmentCharge} from "../entities";

export interface TreatmentBillingRepository {
  postTreatmentCharge(charge: TreatmentCharge): Promise<TreatmentCharge>;
  existsForTreatmentPlanItem(
    clinicId: string,
    treatmentPlanItemId: string,
  ): Promise<boolean>;
}
