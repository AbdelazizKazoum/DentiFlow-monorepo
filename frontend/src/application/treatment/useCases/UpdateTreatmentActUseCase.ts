import type {UpdateTreatmentActCommand} from "@/domain/treatment/commands/UpdateTreatmentActCommand";
import type {TreatmentAct} from "@/domain/treatment/entities/TreatmentAct";
import type {TreatmentActRepository} from "@/domain/treatment/repositories/TreatmentActRepository";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class UpdateTreatmentActUseCase {
  constructor(
    private readonly visitRepository: VisitRepository,
    private readonly treatmentActRepository: TreatmentActRepository,
  ) {}

  async execute(command: UpdateTreatmentActCommand): Promise<TreatmentAct> {
    const act = await this.treatmentActRepository.getById(
      command.treatmentActId,
    );
    const visit = await this.visitRepository.getById(act.visitId);

    if (visit.status !== "OPEN") {
      throw new Error("Confirmed or closed visits cannot be edited.");
    }

    const updated = await this.treatmentActRepository.update(
      command.treatmentActId,
      {
        toothFdi: command.toothFdi,
        quantity: command.quantity,
        surface: command.surface,
        toothPart: command.toothPart,
        dentition: command.dentition,
        status: command.status,
        notes: command.notes,
      },
    );

    const total = await this.treatmentActRepository.calculateVisitTotal(
      act.visitId,
    );
    await this.visitRepository.updateTotalAmount(act.visitId, total);

    return updated;
  }
}
