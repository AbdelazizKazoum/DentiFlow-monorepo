import {InsuranceProvider} from "@domain/patient/entities/insuranceProvider";
import {axiosClient} from "@infrastructure/http/axiosClient";
import {BaseRepository} from "@infrastructure/http/BaseRepository";
import {AppError} from "@infrastructure/http/httpErrorHandler";
import {
  toDomain,
  toCreateDTO,
  toUpdateDTO,
} from "../mappers/insuranceProvider.mapper";
import type {
  InsuranceProviderDTO,
  InsuranceProviderListDTO,
} from "../dtos/insuranceProvider.dto";
import type {IInsuranceProviderRepository} from "@domain/patient/repositories/insuranceProviderRepository";
import type {CreateInsuranceProviderInput} from "@domain/patient/commands/CreateInsuranceProviderInput";
import type {UpdateInsuranceProviderInput} from "@domain/patient/commands/UpdateInsuranceProviderInput";

export class InsuranceProviderHttpRepository
  extends BaseRepository
  implements IInsuranceProviderRepository
{
  constructor(private readonly clinicId: string) {
    super();
  }

  private get base(): string {
    return `/api/v1/clinics/${this.clinicId}/insurance-providers`;
  }

  async findById(id: string): Promise<InsuranceProvider | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<InsuranceProviderDTO>(`${this.base}/${id}`),
      );
      return toDomain(response.data);
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async create(
    provider: CreateInsuranceProviderInput,
  ): Promise<InsuranceProvider> {
    const dto = toCreateDTO(provider);
    const response = await this.execute(() =>
      axiosClient.post<InsuranceProviderDTO>(this.base, dto),
    );
    return toDomain(response.data);
  }

  async update(
    id: string,
    updates: UpdateInsuranceProviderInput,
  ): Promise<InsuranceProvider> {
    const dto = toUpdateDTO(updates);
    const response = await this.execute(() =>
      axiosClient.put<InsuranceProviderDTO>(`${this.base}/${id}`, dto),
    );
    return toDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.execute(() => axiosClient.delete(`${this.base}/${id}`));
  }

  async findByClinicId(clinicId: string): Promise<InsuranceProvider[]> {
    const response = await this.execute(() =>
      axiosClient.get<InsuranceProviderListDTO>(
        `/api/v1/clinics/${clinicId}/insurance-providers`,
      ),
    );
    return response.data.providers.map(toDomain);
  }

  async findActiveByClinicId(clinicId: string): Promise<InsuranceProvider[]> {
    const response = await this.execute(() =>
      axiosClient.get<InsuranceProviderListDTO>(
        `/api/v1/clinics/${clinicId}/insurance-providers`,
        {params: {isActive: true}},
      ),
    );
    return response.data.providers.map(toDomain);
  }

  async findByName(
    clinicId: string,
    name: string,
  ): Promise<InsuranceProvider | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<InsuranceProviderListDTO>(
          `/api/v1/clinics/${clinicId}/insurance-providers`,
          {params: {name}},
        ),
      );
      return response.data.providers[0]
        ? toDomain(response.data.providers[0])
        : null;
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async findByCode(
    clinicId: string,
    code: string,
  ): Promise<InsuranceProvider | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<InsuranceProviderListDTO>(
          `/api/v1/clinics/${clinicId}/insurance-providers`,
          {params: {code}},
        ),
      );
      return response.data.providers[0]
        ? toDomain(response.data.providers[0])
        : null;
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async searchByName(
    clinicId: string,
    searchTerm: string,
  ): Promise<InsuranceProvider[]> {
    const response = await this.execute(() =>
      axiosClient.get<InsuranceProviderListDTO>(
        `/api/v1/clinics/${clinicId}/insurance-providers`,
        {params: {search: searchTerm}},
      ),
    );
    return response.data.providers.map(toDomain);
  }

  async activate(id: string): Promise<InsuranceProvider> {
    const response = await this.execute(() =>
      axiosClient.put<InsuranceProviderDTO>(`${this.base}/${id}/activate`),
    );
    return toDomain(response.data);
  }

  async deactivate(id: string): Promise<InsuranceProvider> {
    const response = await this.execute(() =>
      axiosClient.put<InsuranceProviderDTO>(`${this.base}/${id}/deactivate`),
    );
    return toDomain(response.data);
  }
}
