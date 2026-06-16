import type {AddTreatmentActCommand} from "@/domain/treatment/commands/AddTreatmentActCommand";
import type {TreatmentAct} from "@/domain/treatment/entities/TreatmentAct";
import type {ActCatalogRepository} from "@/domain/treatment/repositories/ActCatalogRepository";
import type {TreatmentActRepository} from "@/domain/treatment/repositories/TreatmentActRepository";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class AddTreatmentActUseCase {
  constructor(
    private readonly visitRepository: VisitRepository,
    private readonly actCatalogRepository: ActCatalogRepository,
    private readonly treatmentActRepository: TreatmentActRepository,
  ) {}

  async execute(command: AddTreatmentActCommand): Promise<TreatmentAct> {
    const visit = await this.visitRepository.getById(command.visitId);

    if (visit.status !== "OPEN") {
      throw new Error("Treatment acts can only be added to open visits.");
    }

    const catalog = await this.actCatalogRepository.getById(
      command.actCatalogId,
    );

    if (!catalog.isActive || catalog.clinicId !== command.clinicId) {
      throw new Error("Act catalog entry is not available for this clinic.");
    }

    const created = await this.treatmentActRepository.save({
      clinicId: command.clinicId,
      visitId: command.visitId,
      actCatalogId: command.actCatalogId,
      toothFdi: command.toothFdi,
      quantity: command.quantity ?? 1,
      unitPrice: catalog.defaultPrice,
      surface: command.surface,
      toothPart: command.toothPart,
      dentition: command.dentition ?? "PERMANENT",
      status: command.status ?? "DONE",
      notes: command.notes,
      enteredBy: command.enteredBy,
    });

    const total = await this.treatmentActRepository.calculateVisitTotal(
      command.visitId,
    );
    await this.visitRepository.updateTotalAmount(command.visitId, total);

    return created;
  }
}
