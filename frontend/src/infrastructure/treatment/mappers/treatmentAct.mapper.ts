import type {TreatmentAct} from "@/domain/treatment/entities/TreatmentAct";
import type {
  CreateTreatmentActDTO,
  TreatmentActDTO,
  UpdateTreatmentActDTO,
} from "../dtos/treatmentAct.dto";

const emptyToUndefined = <T>(value: T | null | undefined): T | undefined =>
  value ?? undefined;

export const treatmentActToDomain = (dto: TreatmentActDTO): TreatmentAct => ({
  id: dto.id,
  clinicId: dto.clinic_id,
  visitId: dto.visit_id,
  actCatalogId: dto.act_catalog_id,
  toothFdi: emptyToUndefined(dto.tooth_fdi),
  quantity: dto.quantity,
  unitPrice: dto.unit_price,
  surface: emptyToUndefined(dto.surface),
  toothPart: emptyToUndefined(dto.tooth_part),
  dentition: dto.dentition,
  status: dto.status,
  notes: emptyToUndefined(dto.notes),
  enteredBy: dto.entered_by,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const treatmentActToCreateDTO = (
  act: Partial<TreatmentAct>,
): CreateTreatmentActDTO => ({
  clinic_id: act.clinicId ?? "",
  visit_id: act.visitId ?? "",
  act_catalog_id: act.actCatalogId ?? "",
  ...(act.toothFdi ? {tooth_fdi: act.toothFdi} : {}),
  ...(act.quantity !== undefined ? {quantity: act.quantity} : {}),
  ...(act.surface ? {surface: act.surface} : {}),
  ...(act.toothPart ? {tooth_part: act.toothPart} : {}),
  ...(act.dentition ? {dentition: act.dentition} : {}),
  ...(act.status ? {status: act.status} : {}),
  ...(act.notes ? {notes: act.notes} : {}),
  entered_by: act.enteredBy ?? "",
});

export const treatmentActToUpdateDTO = (
  act: Partial<TreatmentAct>,
): UpdateTreatmentActDTO => ({
  ...(act.toothFdi !== undefined ? {tooth_fdi: act.toothFdi ?? null} : {}),
  ...(act.quantity !== undefined ? {quantity: act.quantity} : {}),
  ...(act.surface !== undefined ? {surface: act.surface ?? null} : {}),
  ...(act.toothPart !== undefined ? {tooth_part: act.toothPart ?? null} : {}),
  ...(act.dentition !== undefined ? {dentition: act.dentition} : {}),
  ...(act.status !== undefined ? {status: act.status} : {}),
  ...(act.notes !== undefined ? {notes: act.notes ?? null} : {}),
});
