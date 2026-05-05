import { Patient } from "@domain/patient/entities/patient";
import { axiosClient } from "@infrastructure/http/axiosClient";
import { BaseRepository } from "@infrastructure/http/BaseRepository";
import { AppError } from "@infrastructure/http/httpErrorHandler";
import { toDomain, toListItemDomain, toCreateDTO, toUpdateDTO } from "../mappers/patient.mapper";
import type { PatientDTO, PatientListResponseDTO } from "../dtos/patient.dto";
import type { IPatientRepository } from "@domain/patient/repositories/patientRepository";
import type { CreatePatientInput } from "@domain/patient/commands/CreatePatientInput";
import type { UpdatePatientInput } from "@domain/patient/commands/UpdatePatientInput";
import type { GetPatientsQuery } from "@domain/patient/commands/GetPatientsQuery";
import type { PatientListResponse } from "@domain/patient/queries/patientQueries";
import type { PatientStatus } from "@domain/patient/entities/patient";

export class PatientHttpRepository
  extends BaseRepository
  implements IPatientRepository
{
  constructor(private readonly clinicId: string) {
    super();
  }

  private get base(): string {
    return `/api/v1/clinics/${this.clinicId}/patients`;
  }

  async findById(id: string): Promise<Patient | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<PatientDTO>(`${this.base}/${id}`),
      );
      return toDomain(response.data);
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async create(patient: CreatePatientInput): Promise<Patient> {
    const dto = toCreateDTO(patient);
    const response = await this.execute(() =>
      axiosClient.post<PatientDTO>(this.base, dto),
    );
    return toDomain(response.data);
  }

  async update(id: string, updates: UpdatePatientInput): Promise<Patient> {
    const dto = toUpdateDTO(updates);
    const response = await this.execute(() =>
      axiosClient.put<PatientDTO>(`${this.base}/${id}`, dto),
    );
    return toDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.execute(() => axiosClient.delete(`${this.base}/${id}`));
  }

  async findMany(query: GetPatientsQuery): Promise<PatientListResponse> {
    const params: Record<string, string | number | boolean> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit;
    if (query.status !== undefined) params.status = query.status;
    if (query.gender !== undefined) params.gender = query.gender;
    if (query.search !== undefined) params.search = query.search;
    if (query.isNew !== undefined) params.isNew = query.isNew;
    if (query.createdFrom !== undefined)
      params.createdFrom = query.createdFrom.toISOString();
    if (query.createdTo !== undefined)
      params.createdTo = query.createdTo.toISOString();
    if (query.sortBy !== undefined) params.sortBy = query.sortBy;
    if (query.sortOrder !== undefined) params.sortOrder = query.sortOrder;

    const response = await this.execute(() =>
      axiosClient.get<PatientListResponseDTO>(this.base, { params }),
    );
    return {
      items: response.data.items.map(toListItemDomain),
      meta: response.data.meta,
    };
  }

  async findByClinicId(clinicId: string): Promise<Patient[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientListResponseDTO>(
        `/api/v1/clinics/${clinicId}/patients`,
      ),
    );
    return response.data.items.map((item) =>
      toDomain(item as unknown as PatientDTO),
    );
  }

  async findActiveByClinicId(clinicId: string): Promise<Patient[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientListResponseDTO>(
        `/api/v1/clinics/${clinicId}/patients`,
        { params: { status: "ACTIVE" } },
      ),
    );
    return response.data.items.map((item) =>
      toDomain(item as unknown as PatientDTO),
    );
  }

  async findByClinicIdAndStatus(
    clinicId: string,
    status: PatientStatus,
  ): Promise<Patient[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientListResponseDTO>(
        `/api/v1/clinics/${clinicId}/patients`,
        { params: { status } },
      ),
    );
    return response.data.items.map((item) =>
      toDomain(item as unknown as PatientDTO),
    );
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<PatientDTO>(`${this.base}/by-user/${userId}`),
      );
      return toDomain(response.data);
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async searchByName(
    clinicId: string,
    firstName?: string,
    lastName?: string,
  ): Promise<Patient[]> {
    const params: Record<string, string> = {};
    if (firstName) params.firstName = firstName;
    if (lastName) params.lastName = lastName;
    const response = await this.execute(() =>
      axiosClient.get<PatientListResponseDTO>(
        `/api/v1/clinics/${clinicId}/patients/search`,
        { params },
      ),
    );
    return response.data.items.map((item) =>
      toDomain(item as unknown as PatientDTO),
    );
  }

  async searchByPhone(clinicId: string, phone: string): Promise<Patient[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientListResponseDTO>(
        `/api/v1/clinics/${clinicId}/patients`,
        { params: { search: phone } },
      ),
    );
    return response.data.items.map((item) =>
      toDomain(item as unknown as PatientDTO),
    );
  }

  async findWithMedicalInfo(clinicId: string): Promise<Patient[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientListResponseDTO>(
        `/api/v1/clinics/${clinicId}/patients`,
        { params: { hasMedicalInfo: true } },
      ),
    );
    return response.data.items.map((item) =>
      toDomain(item as unknown as PatientDTO),
    );
  }

  async findNewPatients(
    clinicId: string,
    daysThreshold?: number,
  ): Promise<Patient[]> {
    const params: Record<string, string | boolean | number> = { isNew: true };
    if (daysThreshold !== undefined) params.daysThreshold = daysThreshold;
    const response = await this.execute(() =>
      axiosClient.get<PatientListResponseDTO>(
        `/api/v1/clinics/${clinicId}/patients`,
        { params },
      ),
    );
    return response.data.items.map((item) =>
      toDomain(item as unknown as PatientDTO),
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.execute(() =>
      axiosClient.put(`${this.base}/${id}/soft-delete`),
    );
  }

  async restore(id: string): Promise<Patient> {
    const response = await this.execute(() =>
      axiosClient.put<PatientDTO>(`${this.base}/${id}/restore`),
    );
    return toDomain(response.data);
  }
}
