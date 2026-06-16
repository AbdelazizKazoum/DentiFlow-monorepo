import type {GetActCatalogQuery} from "@/domain/treatment/queries/GetActCatalogQuery";
import type {ActCatalog} from "@/domain/treatment/entities/ActCatalog";
import type {
  ActCatalogRepository,
  PaginatedActCatalog,
} from "@/domain/treatment/repositories/ActCatalogRepository";
import {axiosClient} from "@/infrastructure/http/axiosClient";
import {BaseRepository} from "@/infrastructure/http/BaseRepository";
import type {ActCatalogDTO, ActCatalogListDTO} from "../dtos";
import {
  actCatalogToCreateDTO,
  actCatalogToDomain,
  actCatalogToUpdateDTO,
} from "../mappers";

export class ActCatalogHttpRepository
  extends BaseRepository
  implements ActCatalogRepository
{
  private getBase(clinicId: string): string {
    return `/api/v1/clinics/${clinicId}/treatment/act-catalog`;
  }

  async getById(id: string): Promise<ActCatalog> {
    const response = await this.execute(() =>
      axiosClient.get<ActCatalogDTO>(`/api/v1/treatment/act-catalog/${id}`),
    );
    return actCatalogToDomain(response.data);
  }

  async getByClinic(clinicId: string, locale: string): Promise<ActCatalog[]> {
    const response = await this.execute(() =>
      axiosClient.get<ActCatalogListDTO>(this.getBase(clinicId), {
        params: {locale},
      }),
    );
    return (response.data.items ?? response.data.act_catalog ?? []).map(
      actCatalogToDomain,
    );
  }

  async getPaginated(
    query: GetActCatalogQuery,
  ): Promise<PaginatedActCatalog> {
    const response = await this.execute(() =>
      axiosClient.get<ActCatalogListDTO>(this.getBase(query.clinicId), {
        params: {
          locale: query.locale,
          page: query.page,
          limit: query.limit,
        },
      }),
    );
    const items = response.data.items ?? response.data.act_catalog ?? [];

    return {
      items: items.map(actCatalogToDomain),
      total: response.data.total ?? items.length,
    };
  }

  async save(catalog: Partial<ActCatalog>): Promise<ActCatalog> {
    const dto = actCatalogToCreateDTO(catalog);
    const response = await this.execute(() =>
      axiosClient.post<ActCatalogDTO>(this.getBase(dto.clinic_id), dto),
    );
    return actCatalogToDomain(response.data);
  }

  async update(
    id: string,
    updates: Partial<ActCatalog>,
  ): Promise<ActCatalog> {
    const response = await this.execute(() =>
      axiosClient.patch<ActCatalogDTO>(
        `/api/v1/treatment/act-catalog/${id}`,
        actCatalogToUpdateDTO(updates),
      ),
    );
    return actCatalogToDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.execute(() =>
      axiosClient.delete(`/api/v1/treatment/act-catalog/${id}`),
    );
  }
}
