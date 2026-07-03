import type {TreatmentLocation} from "./TreatmentPlanItem";

export type DiagnosisSeverity = "MILD" | "MODERATE" | "SEVERE";
export type DiagnosisCertainty = "SUSPECTED" | "CONFIRMED" | "RULED_OUT";
export type DiagnosisStatus = "ACTIVE" | "RESOLVED" | "MONITORING";
export type DiagnosisEvidence =
  | "VISUAL_EXAM"
  | "X_RAY"
  | "PERCUSSION_TEST"
  | "COLD_TEST"
  | "PERIODONTAL_PROBING";

export interface Diagnosis {
  id: string;
  clinicId: string;
  patientId: string;
  diagnosis: string;
  location: TreatmentLocation;
  severity: DiagnosisSeverity;
  certainty: DiagnosisCertainty;
  status: DiagnosisStatus;
  evidence: DiagnosisEvidence[];
  attachmentIds: string[];
  symptoms: string[];
  painLevel: number;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}
