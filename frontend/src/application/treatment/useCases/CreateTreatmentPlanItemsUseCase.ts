import type {AddTreatmentPlanItemCommand} from "../commands";
import type {DentalAct} from "@/domain/treatment/entities";
import type {TreatmentRepository} from "@/domain/treatment/repositories";
import {AddTreatmentPlanItemUseCase} from "./AddTreatmentPlanItemUseCase";

export class CreateTreatmentPlanItemsUseCase {
  private readonly planner = new AddTreatmentPlanItemUseCase();

  constructor(private readonly repository: TreatmentRepository) {}

  async execute(command: AddTreatmentPlanItemCommand, act: DentalAct) {
    const result = this.planner.execute(command, act);
    if (result.group) {
      await this.repository.saveTreatmentGroup(result.group);
    }
    const items = await this.repository.saveTreatmentPlanItems(result.items);
    return {...result, items};
  }
}
