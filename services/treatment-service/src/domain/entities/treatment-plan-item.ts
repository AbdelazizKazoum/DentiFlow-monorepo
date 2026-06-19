import {Dentition} from "../enums/dentition.enum";
import {ToothPart} from "../enums/tooth-part.enum";
import {ToothSurface} from "../enums/tooth-surface.enum";
import {TreatmentActStatus} from "../enums/treatment-act-status.enum";

/** The long-lived clinical intent. Visit acts are its immutable execution history. */
export class TreatmentPlanItem {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly patientId: string,
    public readonly actCatalogId: string,
    public readonly toothFdi: string | null,
    public readonly surface: ToothSurface | null,
    public readonly toothPart: ToothPart | null,
    public readonly dentition: Dentition | null,
    public readonly status: TreatmentActStatus,
    public readonly diagnosisNotes: string | null,
    public readonly createdVisitId: string,
    public readonly completedVisitId: string | null,
    public readonly createdBy: string,
    public readonly completedBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
