import type {StartTreatmentCommand} from "../commands";
import type {TreatmentRepository} from "@/domain/treatment/repositories";
import {StartTreatmentUseCase} from "./StartTreatmentUseCase";

export class StartTreatmentWithRepositoryUseCase {
  private readonly starter = new StartTreatmentUseCase();

  constructor(private readonly repository: TreatmentRepository) {}

  async execute(command: StartTreatmentCommand) {
    const startWithResult = (
      this.repository as TreatmentRepository & {
        startTreatmentWithResult?: (command: StartTreatmentCommand) => Promise<unknown>;
      }
    ).startTreatmentWithResult;
    if (startWithResult) {
      return startWithResult.call(this.repository, command) as Promise<any>;
    }

    const [workspace, treatmentItem] = await Promise.all([
      this.repository.getWorkspace({
        clinicId: command.clinicId,
        patientId: command.patientId,
        activeVisitId: command.visitId,
      }),
      this.repository.getTreatmentPlanItem(command.treatmentPlanItemId),
    ]);

    const result = this.starter.execute({
      command,
      treatmentItem,
      currentSession: workspace.currentSession,
      charges: workspace.charges,
    });

    if (result.reusedExistingProcedure) return result;

    const [updatedItem, procedure] = await Promise.all([
      this.repository.updateTreatmentPlanItem(
        result.treatmentItem.id,
        result.treatmentItem,
      ),
      this.repository.saveVisitProcedure(result.procedure),
      result.charge
        ? this.repository.saveTreatmentCharge(result.charge)
        : Promise.resolve(undefined),
    ]);

    return {
      ...result,
      treatmentItem: updatedItem,
      procedure,
    };
  }
}
