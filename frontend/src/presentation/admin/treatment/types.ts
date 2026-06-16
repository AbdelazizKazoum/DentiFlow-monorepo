import type {DentalAct} from "@/domain/treatment/entities/dentalAct";
import type {ToothTreatment} from "@/domain/treatment/entities/toothTreatment";

export type TreatmentTab = "chart" | "visualization";

export interface ActCatalogMeta {
  code: string;
  price: number;
  duration: string;
  surface: string;
}

export interface TreatmentTotals {
  teeth: number;
  planned: number;
  completed: number;
  amount: number;
}

export type GroupedTreatmentActs = Record<string, DentalAct[]>;

export interface ToothTreatmentModalState {
  toothId: ToothTreatment["toothId"];
  treatments: ToothTreatment[];
}
