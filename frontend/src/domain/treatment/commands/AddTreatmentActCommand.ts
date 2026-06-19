import type {
  Dentition,
  ToothPart,
  ToothSurface,
  TreatmentActStatus,
} from "../entities/TreatmentAct";

export interface AddTreatmentActCommand {
  visitId: string;
  actCatalogId: string;
  toothFdi?: string;
  quantity?: number;
  surface?: ToothSurface;
  toothPart?: ToothPart;
  dentition?: Dentition;
  status?: TreatmentActStatus;
  notes?: string;
  enteredBy: string;
  clinicId: string;
  treatmentPlanItemId?: string;
  actionType?: "PLANNED" | "PERFORMED" | "AMENDED" | "CANCELLED";
}
