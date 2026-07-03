import type {
  DiagnosisCertainty,
  DiagnosisEvidence,
  DiagnosisSeverity,
  DiagnosisStatus,
} from "../entities";

export const DIAGNOSES_CATALOG = [
  "Dental Caries",
  "Pulpitis",
  "Gingivitis",
  "Periodontitis",
  "Fractured Tooth",
  "Impacted Tooth",
  "Abscess",
  "Bone Loss",
];

export const DIAGNOSIS_SEVERITY_OPTIONS: DiagnosisSeverity[] = [
  "MILD",
  "MODERATE",
  "SEVERE",
];

export const DIAGNOSIS_CERTAINTY_OPTIONS: DiagnosisCertainty[] = [
  "SUSPECTED",
  "CONFIRMED",
  "RULED_OUT",
];

export const DIAGNOSIS_STATUS_OPTIONS: DiagnosisStatus[] = [
  "ACTIVE",
  "RESOLVED",
  "MONITORING",
];

export const DIAGNOSIS_EVIDENCE_OPTIONS: DiagnosisEvidence[] = [
  "VISUAL_EXAM",
  "X_RAY",
  "PERCUSSION_TEST",
  "COLD_TEST",
  "PERIODONTAL_PROBING",
];

export const DIAGNOSIS_SYMPTOM_OPTIONS = [
  "Pain",
  "Sensitivity",
  "Swelling",
  "Bleeding",
  "Mobility",
];
