import {PatientInsurance} from "@domain/patient/entities/patientInsurance";
import {axiosClient} from "@infrastructure/http/axiosClient";
import {BaseRepository} from "@infrastructure/http/BaseRepository";
import {AppError} from "@infrastructure/http/httpErrorHandler";
import {
  toDomain,
  toCreateDTO,
  toUpdateDTO,
} from "../mappers/patientInsurance.mapper";
import type {
  PatientInsuranceDTO,
  PatientInsuranceListDTO,
} from "../dtos/patientInsurance.dto";
import type {IPatientInsuranceRepository} from "@domain/patient/repositories/patientInsuranceRepository";
import type {CreatePatientInsuranceInput} from "@domain/patient/commands/CreatePatientInsuranceInput";
import type {UpdatePatientInsuranceInput} from "@domain/patient/commands/UpdatePatientInsuranceInput";

export class PatientInsuranceHttpRepository
  extends BaseRepository
  implements IPatientInsuranceRepository
{
  constructor(private readonly clinicId: string) {
    super();
  }

  private base(patientId: string): string {
    return `/api/v1/clinics/${this.clinicId}/patients/${patientId}/insurance`;
  }

  private get clinicBase(): string {
    return `/api/v1/clinics/${this.clinicId}/patient-insurance`;
  }

  async findById(id: string): Promise<PatientInsurance | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<PatientInsuranceDTO>(`${this.clinicBase}/${id}`),
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
    insurance: CreatePatientInsuranceInput,
  ): Promise<PatientInsurance> {
    const dto = toCreateDTO(insurance);
    const response = await this.execute(() =>
      axiosClient.post<PatientInsuranceDTO>(
        this.base(insurance.patientId),
        dto,
      ),
    );
    return toDomain(response.data);
  }

  async update(
    id: string,
    updates: UpdatePatientInsuranceInput,
  ): Promise<PatientInsurance> {
    const dto = toUpdateDTO(updates);
    const response = await this.execute(() =>
      axiosClient.put<PatientInsuranceDTO>(`${this.clinicBase}/${id}`, dto),
    );
    return toDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.execute(() => axiosClient.delete(`${this.clinicBase}/${id}`));
  }

  async findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientInsuranceListDTO>(
        `/api/v1/clinics/${clinicId}/patients/${patientId}/insurance`,
      ),
    );
    return response.data.insurances.map(toDomain);
  }

  async findActiveByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientInsurance[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientInsuranceListDTO>(
        `/api/v1/clinics/${clinicId}/patients/${patientId}/insurance`,
        {params: {isActive: true}},
      ),
    );
    return response.data.insurances.map(toDomain);
  }

  async findByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientInsuranceListDTO>(
        `/api/v1/clinics/${clinicId}/patient-insurance`,
        {params: {insuranceProviderId: providerId}},
      ),
    );
    return response.data.insurances.map(toDomain);
  }

  async findActiveByProviderId(
    clinicId: string,
    providerId: string,
  ): Promise<PatientInsurance[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientInsuranceListDTO>(
        `/api/v1/clinics/${clinicId}/patient-insurance`,
        {params: {insuranceProviderId: providerId, isActive: true}},
      ),
    );
    return response.data.insurances.map(toDomain);
  }

  async findByClinicId(clinicId: string): Promise<PatientInsurance[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientInsuranceListDTO>(
        `/api/v1/clinics/${clinicId}/patient-insurance`,
      ),
    );
    return response.data.insurances.map(toDomain);
  }

  async findActiveByClinicId(clinicId: string): Promise<PatientInsurance[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientInsuranceListDTO>(
        `/api/v1/clinics/${clinicId}/patient-insurance`,
        {params: {isActive: true}},
      ),
    );
    return response.data.insurances.map(toDomain);
  }

  async findByPolicyNumber(
    clinicId: string,
    policyNumber: string,
  ): Promise<PatientInsurance[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientInsuranceListDTO>(
        `/api/v1/clinics/${clinicId}/patient-insurance`,
        {params: {policyNumber}},
      ),
    );
    return response.data.insurances.map(toDomain);
  }

  async findByMemberId(
    clinicId: string,
    memberId: string,
  ): Promise<PatientInsurance[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientInsuranceListDTO>(
        `/api/v1/clinics/${clinicId}/patient-insurance`,
        {params: {memberId}},
      ),
    );
    return response.data.insurances.map(toDomain);
  }

  async activate(id: string): Promise<PatientInsurance> {
    const response = await this.execute(() =>
      axiosClient.put<PatientInsuranceDTO>(`${this.clinicBase}/${id}/activate`),
    );
    return toDomain(response.data);
  }

  async deactivate(id: string): Promise<PatientInsurance> {
    const response = await this.execute(() =>
      axiosClient.put<PatientInsuranceDTO>(
        `${this.clinicBase}/${id}/deactivate`,
      ),
    );
    return toDomain(response.data);
  }

  async activateAllForPatient(
    clinicId: string,
    patientId: string,
  ): Promise<void> {
    await this.execute(() =>
      axiosClient.put(
        `/api/v1/clinics/${clinicId}/patients/${patientId}/insurance/activate-all`,
      ),
    );
  }

  async deactivateAllForPatient(
    clinicId: string,
    patientId: string,
  ): Promise<void> {
    await this.execute(() =>
      axiosClient.put(
        `/api/v1/clinics/${clinicId}/patients/${patientId}/insurance/deactivate-all`,
      ),
    );
  }
}
