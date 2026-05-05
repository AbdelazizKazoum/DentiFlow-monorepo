import { InsuranceTemplate } from "@domain/patient/entities/insuranceTemplate";
import { axiosClient } from "@infrastructure/http/axiosClient";
import { BaseRepository } from "@infrastructure/http/BaseRepository";
import { AppError } from "@infrastructure/http/httpErrorHandler";
import { toDomain, toCreateDTO, toUpdateDTO } from "../mappers/insuranceTemplate.mapper";
import type { InsuranceTemplateDTO, InsuranceTemplateListDTO } from "../dtos/insuranceTemplate.dto";
import type { IInsuranceTemplateRepository } from "@domain/patient/repositories/insuranceTemplateRepository";
import type { CreateInsuranceTemplateInput } from "@domain/patient/commands/CreateInsuranceTemplateInput";
import type { UpdateInsuranceTemplateInput } from "@domain/patient/commands/UpdateInsuranceTemplateInput";

export class InsuranceTemplateHttpRepository
  extends BaseRepository
  implements IInsuranceTemplateRepository
{
  constructor(private readonly clinicId: string) {
    super();
  }

  private get base(): string {
    return `/api/v1/clinics/${this.clinicId}/insurance-templates`;
  }

  async findById(id: string): Promise<InsuranceTemplate | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<InsuranceTemplateDTO>(`${this.base}/${id}`),
      );
      return toDomain(response.data);
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async create(template: CreateInsuranceTemplateInput): Promise<InsuranceTemplate> {
    const dto = toCreateDTO(template);
    const response = await this.execute(() =>
      axiosClient.post<InsuranceTemplateDTO>(this.base, dto),
    );
    return toDomain(response.data);
  }

  async update(id: string, updates: UpdateInsuranceTemplateInput): Promise<InsuranceTemplate> {
    const dto = toUpdateDTO(updates);
    const response = await this.execute(() =>
      axiosClient.put<InsuranceTemplateDTO>(`${this.base}/${id}`, dto),
    );
    return toDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.execute(() => axiosClient.delete(`${this.base}/${id}`));
  }

  async findByProviderId(providerId: string): Promise<InsuranceTemplate[]> {
    const response = await this.execute(() =>
      axiosClient.get<InsuranceTemplateListDTO>(this.base, {
        params: { insuranceProviderId: providerId },
      }),
    );
    return response.data.templates.map(toDomain);
  }

  async findByProviderIds(providerIds: string[]): Promise<InsuranceTemplate[]> {
    const response = await this.execute(() =>
      axiosClient.get<InsuranceTemplateListDTO>(this.base, {
        params: { insuranceProviderIds: providerIds.join(",") },
      }),
    );
    return response.data.templates.map(toDomain);
  }

  async findByName(providerId: string, name: string): Promise<InsuranceTemplate | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<InsuranceTemplateListDTO>(this.base, {
          params: { insuranceProviderId: providerId, name },
        }),
      );
      return response.data.templates[0]
        ? toDomain(response.data.templates[0])
        : null;
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async searchByName(searchTerm: string): Promise<InsuranceTemplate[]> {
    const response = await this.execute(() =>
      axiosClient.get<InsuranceTemplateListDTO>(this.base, {
        params: { search: searchTerm },
      }),
    );
    return response.data.templates.map(toDomain);
  }

  async findAll(): Promise<InsuranceTemplate[]> {
    const response = await this.execute(() =>
      axiosClient.get<InsuranceTemplateListDTO>(this.base),
    );
    return response.data.templates.map(toDomain);
  }
}
