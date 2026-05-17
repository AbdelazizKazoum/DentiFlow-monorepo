type RemoveTreatmentFn = (id: string) => void;

export class RemoveTreatmentUseCase {
  constructor(private readonly removeTreatment: RemoveTreatmentFn) {}

  execute(id: string): void {
    if (!id) {
      throw new Error("A treatment id is required.");
    }

    this.removeTreatment(id);
  }
}
