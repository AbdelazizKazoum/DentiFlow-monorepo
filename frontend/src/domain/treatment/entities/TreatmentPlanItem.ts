import type {Dentition, ToothPart, ToothSurface, TreatmentActStatus} from "./TreatmentAct";

/** Patient-level clinical intent; it survives individual visits. */
export interface TreatmentPlanItem {
  id: string;
  clinicId: string;
  patientId: string;
  actCatalogId: string;
  toothFdi?: string;
  surface?: ToothSurface;
  toothPart?: ToothPart;
  dentition?: Dentition;
  status: TreatmentActStatus;
  diagnosisNotes?: string;
  createdVisitId: string;
  completedVisitId?: string;
  createdBy: string;
  completedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
