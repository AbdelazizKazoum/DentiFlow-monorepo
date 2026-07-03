import type {SaveVisitHandoffCommand} from "../commands";
import type {VisitHandoff} from "@/domain/treatment/entities";
import type {TreatmentRepository} from "@/domain/treatment/repositories";
import {SaveVisitHandoffUseCase} from "./SaveVisitHandoffUseCase";

export class SaveVisitHandoffWithRepositoryUseCase {
  private readonly saver = new SaveVisitHandoffUseCase();

  constructor(private readonly repository: TreatmentRepository) {}

  async execute(command: SaveVisitHandoffCommand, existing?: VisitHandoff) {
    const handoff = this.saver.execute(command, existing);
    return this.repository.saveVisitHandoff(handoff);
  }
}
