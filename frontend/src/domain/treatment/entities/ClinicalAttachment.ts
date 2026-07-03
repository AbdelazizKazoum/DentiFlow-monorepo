export type ClinicalAttachmentType = "RADIOLOGY" | "PHOTO" | "DOCUMENT";

export interface ClinicalAttachment {
  id: string;
  clinicId: string;
  patientId: string;
  visitId?: string;
  type: ClinicalAttachmentType;
  title: string;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
}
