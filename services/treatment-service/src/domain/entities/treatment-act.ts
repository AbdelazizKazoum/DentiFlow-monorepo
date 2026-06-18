import {Dentition} from "../enums/dentition.enum";
import {ToothPart} from "../enums/tooth-part.enum";
import {ToothSurface} from "../enums/tooth-surface.enum";
import {TreatmentActStatus} from "../enums/treatment-act-status.enum";

export class TreatmentAct {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly visitId: string,
    public readonly actCatalogId: string,
    public readonly toothFdi: string | null,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly surface: ToothSurface | null,
    public readonly toothPart: ToothPart | null,
    public readonly dentition: Dentition | null,
    public readonly status: TreatmentActStatus,
    public readonly notes: string | null,
    public readonly enteredBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
