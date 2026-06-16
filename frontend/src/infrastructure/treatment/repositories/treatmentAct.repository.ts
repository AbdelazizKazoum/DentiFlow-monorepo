import type {TreatmentAct} from "@/domain/treatment/entities/TreatmentAct";
import type {TreatmentActRepository} from "@/domain/treatment/repositories/TreatmentActRepository";
import {axiosClient} from "@/infrastructure/http/axiosClient";
import {BaseRepository} from "@/infrastructure/http/BaseRepository";
import type {TreatmentActDTO, TreatmentActListDTO} from "../dtos";
import {
  treatmentActToCreateDTO,
  treatmentActToDomain,
  treatmentActToUpdateDTO,
} from "../mappers";

export class TreatmentActHttpRepository
  extends BaseRepository
  implements TreatmentActRepository
{
  private getVisitBase(visitId: string): string {
    return `/api/v1/treatment/visits/${visitId}/acts`;
  }

  async getById(id: string): Promise<TreatmentAct> {
    const response = await this.execute(() =>
      axiosClient.get<TreatmentActDTO>(`/api/v1/treatment/acts/${id}`),
    );
    return treatmentActToDomain(response.data);
  }

  async getByVisitId(visitId: string): Promise<TreatmentAct[]> {
    const response = await this.execute(() =>
      axiosClient.get<TreatmentActListDTO>(this.getVisitBase(visitId)),
    );
    return (response.data.items ?? response.data.treatment_acts ?? []).map(
      treatmentActToDomain,
    );
  }

  async save(act: Partial<TreatmentAct>): Promise<TreatmentAct> {
    const dto = treatmentActToCreateDTO(act);
    const response = await this.execute(() =>
      axiosClient.post<TreatmentActDTO>(this.getVisitBase(dto.visit_id), dto),
    );
    return treatmentActToDomain(response.data);
  }

  async update(
    id: string,
    updates: Partial<TreatmentAct>,
  ): Promise<TreatmentAct> {
    const response = await this.execute(() =>
      axiosClient.patch<TreatmentActDTO>(
        `/api/v1/treatment/acts/${id}`,
        treatmentActToUpdateDTO(updates),
      ),
    );
    return treatmentActToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.execute(() =>
      axiosClient.delete(`/api/v1/treatment/acts/${id}`),
    );
  }

  async calculateVisitTotal(visitId: string): Promise<number> {
    const response = await this.execute(() =>
      axiosClient.get<{total_amount: number}>(
        `/api/v1/treatment/visits/${visitId}/total`,
      ),
    );
    return response.data.total_amount;
  }
}
