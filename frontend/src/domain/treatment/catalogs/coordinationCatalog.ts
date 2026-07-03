import type {DocumentRequestType} from "../entities";

export const DOCUMENT_REQUEST_TYPES: Array<{
  id: DocumentRequestType;
  label: string;
}> = [
  {id: "PRESCRIPTION", label: "Prescription"},
  {id: "MEDICAL_CERTIFICATE", label: "Medical certificate"},
  {id: "CLINICAL_REPORT", label: "Clinical report"},
];
