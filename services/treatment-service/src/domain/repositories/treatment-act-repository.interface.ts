import {TreatmentAct} from "../entities/treatment-act";
import {Dentition} from "../enums/dentition.enum";
import {ToothPart} from "../enums/tooth-part.enum";
import {ToothSurface} from "../enums/tooth-surface.enum";
import {TreatmentActStatus} from "../enums/treatment-act-status.enum";

export interface AddTreatmentActInput {
  clinicId: string;
  visitId: string;
  actCatalogId: string;
  toothFdi?: string | null;
  quantity?: number;
  unitPrice: number;
  surface?: ToothSurface | null;
  toothPart?: ToothPart | null;
  dentition?: Dentition | null;
  status?: TreatmentActStatus;
  notes?: string | null;
  enteredBy: string;
}

export interface UpdateTreatmentActInput {
  toothFdi?: string | null;
  quantity?: number;
  surface?: ToothSurface | null;
  toothPart?: ToothPart | null;
  dentition?: Dentition | null;
  status?: TreatmentActStatus;
  notes?: string | null;
}

export interface ITreatmentActRepository {
  findById(id: string): Promise<TreatmentAct | null>;
  listByVisit(visitId: string): Promise<TreatmentAct[]>;
  create(input: AddTreatmentActInput): Promise<TreatmentAct>;
  update(id: string, input: UpdateTreatmentActInput): Promise<TreatmentAct>;
  delete(id: string): Promise<void>;
  countByVisit(visitId: string): Promise<number>;
  hasDoneAct(visitId: string): Promise<boolean>;
  calculateTotal(visitId: string): Promise<number>;
}
