import type {
  Dentition,
  ToothPart,
  ToothSurface,
  TreatmentActStatus,
} from "../entities/TreatmentAct";

export interface UpdateTreatmentActCommand {
  treatmentActId: string;
  toothFdi?: string;
  quantity?: number;
  surface?: ToothSurface;
  toothPart?: ToothPart;
  dentition?: Dentition;
  status?: TreatmentActStatus;
  notes?: string;
}
