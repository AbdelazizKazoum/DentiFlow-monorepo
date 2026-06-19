import type {TreatmentPlanItem} from "@/domain/treatment/entities/TreatmentPlanItem";
import type {TreatmentPlanRepository} from "@/domain/treatment/repositories/TreatmentPlanRepository";
import {axiosClient} from "@/infrastructure/http/axiosClient";
import {BaseRepository} from "@/infrastructure/http/BaseRepository";
import type {TreatmentPlanItemDTO, TreatmentPlanItemListDTO} from "../dtos/treatmentPlanItem.dto";
import {treatmentPlanItemToDomain} from "../mappers/treatmentPlanItem.mapper";
export class TreatmentPlanHttpRepository extends BaseRepository implements TreatmentPlanRepository {
  async getByPatient(clinicId: string, patientId: string, includeCancelled = false): Promise<TreatmentPlanItem[]> { const response = await this.execute(() => axiosClient.get<TreatmentPlanItemListDTO>(`/api/v1/clinics/${clinicId}/patients/${patientId}/treatment-plan`, {params: {include_cancelled: includeCancelled}})); return response.data.items.map(treatmentPlanItemToDomain); }
  async create(item: Partial<TreatmentPlanItem>): Promise<TreatmentPlanItem> { const response = await this.execute(() => axiosClient.post<TreatmentPlanItemDTO>(`/api/v1/clinics/${item.clinicId}/patients/${item.patientId}/treatment-plan`, {act_catalog_id: item.actCatalogId, tooth_fdi: item.toothFdi, surface: item.surface, tooth_part: item.toothPart, dentition: item.dentition, diagnosis_notes: item.diagnosisNotes, created_visit_id: item.createdVisitId})); return treatmentPlanItemToDomain(response.data); }
}
