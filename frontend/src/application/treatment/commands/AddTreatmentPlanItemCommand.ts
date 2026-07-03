import type {
  DentitionMode,
  SurfaceCode,
  TreatmentPriority,
} from "@/domain/treatment/entities";

export interface AddTreatmentPlanItemCommand {
  clinicId: string;
  patientId: string;
  actId: string;
  selectedTeeth: number[];
  mouthRegionId?: string;
  surfacesByTooth: Record<number, SurfaceCode[]>;
  priority: TreatmentPriority;
  notes?: string;
  dentition: DentitionMode;
  providerId: string;
}
