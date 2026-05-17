export type TreatmentStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface DentalAct {
  id: string;
  label: string;
  icon: string;
  category: string;
  defaultStatus: TreatmentStatus;
  colorHex: string;
}
