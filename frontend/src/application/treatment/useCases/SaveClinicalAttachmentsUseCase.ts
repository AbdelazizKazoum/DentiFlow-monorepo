import type {SaveClinicalAttachmentsCommand} from "../commands";
import type {TreatmentRepository} from "@/domain/treatment/repositories";

export class SaveClinicalAttachmentsUseCase {
  constructor(private readonly repository: TreatmentRepository) {}

  async execute(command: SaveClinicalAttachmentsCommand) {
    return this.repository.saveClinicalAttachments(command.attachments);
  }
}
