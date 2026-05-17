import type {TreatmentStatus} from "./dentalAct";

export type ToothId = string;

export interface ToothTreatment {
  id: string;
  toothId: ToothId;
  actId: string;
  actLabel: string;
  actIcon: string;
  actColor: string;
  status: TreatmentStatus;
  position: [number, number, number];
  notes?: string;
  createdAt: string;
}
