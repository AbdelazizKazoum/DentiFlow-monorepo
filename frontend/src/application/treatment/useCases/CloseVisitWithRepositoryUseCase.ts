import type {CloseVisitCommand} from "../commands";
import type {TreatmentRepository} from "@/domain/treatment/repositories";
import {CloseVisitUseCase} from "./CloseVisitUseCase";

export class CloseVisitWithRepositoryUseCase {
  private readonly closer = new CloseVisitUseCase();

  constructor(private readonly repository: TreatmentRepository) {}

  async execute(command: CloseVisitCommand) {
    const closeWithResult = (
      this.repository as TreatmentRepository & {
        closeVisitWithResult?: (command: CloseVisitCommand) => Promise<unknown>;
      }
    ).closeVisitWithResult;
    if (closeWithResult) {
      return closeWithResult.call(this.repository, command) as Promise<any>;
    }

    const result = this.closer.execute(command);
    const [followUpRequest, documentRequest] = await Promise.all([
      result.followUpRequest
        ? this.repository.saveFollowUpRequest(result.followUpRequest)
        : Promise.resolve(undefined),
      result.documentRequest
        ? this.repository.saveDocumentRequest(result.documentRequest)
        : Promise.resolve(undefined),
    ]);

    return {followUpRequest, documentRequest};
  }
}
