import type {DentalAct} from "@/domain/treatment/entities/dentalAct";
import type {
  ToothId,
  ToothTreatment,
} from "@/domain/treatment/entities/toothTreatment";

type AddTreatmentFn = (treatment: ToothTreatment) => void;

export class AddTreatmentUseCase {
  constructor(private readonly addTreatment: AddTreatmentFn) {}

  execute(
    act: DentalAct,
    toothId: ToothId,
    position: [number, number, number],
  ): ToothTreatment {
    if (!act?.id) {
      throw new Error("A dental act is required.");
    }

    if (!toothId?.startsWith("tooth_")) {
      throw new Error("A valid tooth id is required.");
    }

    const treatment: ToothTreatment = {
      id: crypto.randomUUID(),
      toothId,
      actId: act.id,
      actLabel: act.label,
      actIcon: act.icon,
      actColor: act.colorHex,
      status: act.defaultStatus,
      position,
      createdAt: new Date().toISOString(),
    };

    this.addTreatment(treatment);
    return treatment;
  }
}
