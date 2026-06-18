import type {VisitStatus} from "@/domain/treatment/entities/Visit";
import type {TreatmentActDTO} from "./treatmentAct.dto";

export interface VisitDTO {
  id: string;
  clinic_id: string;
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  assistant_id?: string | null;
  assistant_name?: string | null;
  status: VisitStatus;
  total_amount: number;
  confirmed_at?: string | null;
  confirmed_by?: string | null;
  voided_at?: string | null;
  void_reason?: string | null;
  created_at: string;
  updated_at: string;
  treatment_acts?: TreatmentActDTO[];
}

export interface VisitListDTO {
  items?: VisitDTO[];
  visits?: VisitDTO[];
  total?: number;
}

export interface CreateVisitDTO {
  appointment_id: string;
  clinic_id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
}

export interface AssignAssistantDTO {
  assistant_id: string;
  assistant_name: string;
}

export interface ConfirmVisitDTO {
  confirmed_by: string;
}

export interface VoidVisitDTO {
  reason: string;
}
