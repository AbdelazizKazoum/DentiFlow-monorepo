export type ToothSurface =
  | "MESIAL"
  | "DISTAL"
  | "OCCLUSAL"
  | "BUCCAL"
  | "LINGUAL"
  | "PALATAL"
  | "INCISAL";

export type ToothPart = "CROWN" | "ROOT" | "WHOLE_TOOTH";
export type Dentition = "PERMANENT" | "PRIMARY";
export type TreatmentActStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED";
export type TreatmentActionType = "PLANNED" | "PERFORMED" | "AMENDED" | "CANCELLED";

export interface TreatmentAct {
  id: string;
  clinicId: string;
  visitId: string;
  treatmentPlanItemId?: string;
  actCatalogId: string;
  toothFdi?: string;
  quantity: number;
  unitPrice: number;
  surface?: ToothSurface;
  toothPart?: ToothPart;
  dentition: Dentition;
  status: TreatmentActStatus;
  actionType: TreatmentActionType;
  notes?: string;
  enteredBy: string;
  createdAt: Date;
  updatedAt: Date;
}
