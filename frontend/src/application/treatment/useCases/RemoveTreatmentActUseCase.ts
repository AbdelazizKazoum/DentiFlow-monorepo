import type {RemoveTreatmentActCommand} from "@/domain/treatment/commands/RemoveTreatmentActCommand";
import type {TreatmentActRepository} from "@/domain/treatment/repositories/TreatmentActRepository";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class RemoveTreatmentActUseCase {
  constructor(
    private readonly visitRepository: VisitRepository,
    private readonly treatmentActRepository: TreatmentActRepository,
  ) {}

  async execute(command: RemoveTreatmentActCommand): Promise<void> {
    const act = await this.treatmentActRepository.getById(
      command.treatmentActId,
    );

    if (act.visitId !== command.visitId) {
      throw new Error("Treatment act does not belong to this visit.");
    }

    const visit = await this.visitRepository.getById(command.visitId);

    if (visit.status !== "OPEN") {
      throw new Error("Confirmed or closed visits cannot be edited.");
    }

    await this.treatmentActRepository.delete(command.treatmentActId);
    const total = await this.treatmentActRepository.calculateVisitTotal(
      command.visitId,
    );
    await this.visitRepository.updateTotalAmount(command.visitId, total);
  }
}
