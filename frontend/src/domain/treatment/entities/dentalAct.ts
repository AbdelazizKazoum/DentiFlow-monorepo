export type SurfaceCode = "V" | "P" | "L" | "M" | "D" | "O" | "R";

export type ActVisualType =
  | "filling"
  | "root_canal"
  | "crown"
  | "extraction"
  | "implant"
  | "graft";

export type ActCategory =
  | "GENERAL"
  | "RADIOGRAPHY"
  | "PREVENTIVE"
  | "RESTORATIVE"
  | "ENDODONTICS"
  | "SURGERY"
  | "PROSTHETICS"
  | "AESTHETIC"
  | "ORTHODONTICS";

export type LegacyTreatmentStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TreatmentStatus = LegacyTreatmentStatus;

export interface DentalAct {
  id: string;
  name: string;
  category: ActCategory;
  price: number;
  groupableTeeth: boolean;
  affectsTooth: boolean;
  visualType?: ActVisualType;
  defaultSurfaces?: SurfaceCode[];

  // Legacy fields used by the existing 3D chart palette until it is migrated.
  label: string;
  icon: string;
  defaultStatus: LegacyTreatmentStatus;
  colorHex: string;
}
