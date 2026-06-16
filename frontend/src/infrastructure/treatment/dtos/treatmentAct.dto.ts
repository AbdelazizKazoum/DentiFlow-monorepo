import type {
  Dentition,
  ToothPart,
  ToothSurface,
  TreatmentActStatus,
} from "@/domain/treatment/entities/TreatmentAct";

export interface TreatmentActDTO {
  id: string;
  clinic_id: string;
  visit_id: string;
  act_catalog_id: string;
  tooth_fdi?: string | null;
  quantity: number;
  unit_price: number;
  surface?: ToothSurface | null;
  tooth_part?: ToothPart | null;
  dentition: Dentition;
  status: TreatmentActStatus;
  notes?: string | null;
  entered_by: string;
  created_at: string;
  updated_at: string;
}

export interface TreatmentActListDTO {
  items?: TreatmentActDTO[];
  treatment_acts?: TreatmentActDTO[];
  total?: number;
}

export interface CreateTreatmentActDTO {
  clinic_id: string;
  visit_id: string;
  act_catalog_id: string;
  tooth_fdi?: string;
  quantity?: number;
  surface?: ToothSurface;
  tooth_part?: ToothPart;
  dentition?: Dentition;
  status?: TreatmentActStatus;
  notes?: string;
  entered_by: string;
}

export interface UpdateTreatmentActDTO {
  tooth_fdi?: string | null;
  quantity?: number;
  surface?: ToothSurface | null;
  tooth_part?: ToothPart | null;
  dentition?: Dentition;
  status?: TreatmentActStatus;
  notes?: string | null;
}
