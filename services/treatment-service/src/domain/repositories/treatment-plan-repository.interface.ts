import {Dentition} from "../enums/dentition.enum";
import {ToothPart} from "../enums/tooth-part.enum";
import {ToothSurface} from "../enums/tooth-surface.enum";
import {TreatmentActStatus} from "../enums/treatment-act-status.enum";
import {TreatmentPlanItem} from "../entities/treatment-plan-item";

export interface CreateTreatmentPlanInput {
  clinicId: string;
  patientId: string;
  actCatalogId: string;
  toothFdi?: string | null;
  surface?: ToothSurface | null;
  toothPart?: ToothPart | null;
  dentition?: Dentition | null;
  diagnosisNotes?: string | null;
  createdVisitId: string;
  createdBy: string;
}

export interface ITreatmentPlanRepository {
  findById(id: string): Promise<TreatmentPlanItem | null>;
  listByPatient(clinicId: string, patientId: string, includeCancelled?: boolean): Promise<TreatmentPlanItem[]>;
  create(input: CreateTreatmentPlanInput): Promise<TreatmentPlanItem>;
  updateStatus(id: string, status: TreatmentActStatus, completedVisitId?: string | null, completedBy?: string | null): Promise<TreatmentPlanItem>;
}
