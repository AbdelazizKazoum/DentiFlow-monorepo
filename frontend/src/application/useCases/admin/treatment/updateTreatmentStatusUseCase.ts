import type {TreatmentStatus} from "@/domain/treatment/entities/dentalAct";
import type {ToothTreatment} from "@/domain/treatment/entities/toothTreatment";

type UpdateTreatmentFn = (
  id: string,
  patch: Partial<ToothTreatment>,
) => void;

const VALID_STATUSES: TreatmentStatus[] = [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
];

export class UpdateTreatmentStatusUseCase {
  constructor(private readonly updateTreatment: UpdateTreatmentFn) {}

  execute(id: string, status: TreatmentStatus): void {
    if (!id) {
      throw new Error("A treatment id is required.");
    }

    if (!VALID_STATUSES.includes(status)) {
      throw new Error("A valid treatment status is required.");
    }

    this.updateTreatment(id, {status});
  }
}
