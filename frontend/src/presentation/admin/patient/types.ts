import {
  PatientStatus,
  PatientGender,
} from "@/domain/patient/entities/patient";
import { DocumentType } from "@/domain/patient/entities/patientDocument";
import type { SortOption } from "./patientConfig";

export type { SortOption };

export interface PatientFormState {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: PatientGender | "";
  address: string;
  status: PatientStatus;
  notes: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  medicalNotes: string;
  cnie: string;
}

export interface InsuranceFormState {
  insuranceProviderId: string;
  isActive: boolean;
  policyNumber: string;
  memberId: string;
}

export interface DocumentItemState {
  id: string;
  type: DocumentType;
  fileUrl: string;
  title: string;
  createdAt: string;
}

export interface FilterState {
  status: PatientStatus | "all";
  gender: PatientGender | "all";
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export const EMPTY_FORM: PatientFormState = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  status: PatientStatus.ACTIVE,
  notes: "",
  allergies: "",
  chronicConditions: "",
  currentMedications: "",
  medicalNotes: "",
  cnie: "",
};
