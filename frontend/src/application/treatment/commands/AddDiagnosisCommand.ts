import type {
  DentitionMode,
  DiagnosisCertainty,
  DiagnosisEvidence,
  DiagnosisSeverity,
  DiagnosisStatus,
  SurfaceCode,
} from "@/domain/treatment/entities";

export interface AddDiagnosisCommand {
  clinicId: string;
  patientId: string;
  diagnosis: string;
  selectedTeeth: number[];
  mouthRegionId?: string;
  surfacesByTooth: Record<number, SurfaceCode[]>;
  severity: DiagnosisSeverity;
  certainty: DiagnosisCertainty;
  status: DiagnosisStatus;
  evidence: DiagnosisEvidence[];
  attachmentIds: string[];
  symptoms: string[];
  painLevel: number;
  notes?: string;
  dentition: DentitionMode;
  providerId: string;
}
