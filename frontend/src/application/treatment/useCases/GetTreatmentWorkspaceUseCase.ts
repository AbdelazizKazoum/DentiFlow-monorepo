import type {GetTreatmentWorkspaceQuery} from "../queries";
import type {TreatmentRepository} from "@/domain/treatment/repositories";

export class GetTreatmentWorkspaceUseCase {
  constructor(private readonly repository: TreatmentRepository) {}

  execute(query: GetTreatmentWorkspaceQuery) {
    return this.repository.getWorkspace(query);
  }
}
