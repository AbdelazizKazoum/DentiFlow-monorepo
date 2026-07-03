import type {
  ClinicalAttachment,
  ClinicalAttachmentType,
} from "../entities";

export interface UploadClinicalAttachmentInput {
  clinicId: string;
  patientId: string;
  visitId?: string;
  type: ClinicalAttachmentType;
  file: File;
  uploadedBy: string;
}

export interface ClinicalAttachmentRepository {
  upload(input: UploadClinicalAttachmentInput): Promise<ClinicalAttachment>;
  getByPatient(
    clinicId: string,
    patientId: string,
  ): Promise<ClinicalAttachment[]>;
}
