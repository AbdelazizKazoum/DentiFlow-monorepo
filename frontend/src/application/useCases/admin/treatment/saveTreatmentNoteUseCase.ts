import type {ToothTreatment} from "@/domain/treatment/entities/toothTreatment";

type UpdateTreatmentFn = (
  id: string,
  patch: Partial<ToothTreatment>,
) => void;

export class SaveTreatmentNoteUseCase {
  constructor(private readonly updateTreatment: UpdateTreatmentFn) {}

  execute(id: string, notes: string): void {
    if (!id) {
      throw new Error("A treatment id is required.");
    }

    this.updateTreatment(id, {notes: notes.trim()});
  }
}
