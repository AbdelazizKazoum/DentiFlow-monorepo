import type {ClinicalAttachment} from "@/domain/treatment/entities";

export interface SaveClinicalAttachmentsCommand {
  attachments: ClinicalAttachment[];
}
