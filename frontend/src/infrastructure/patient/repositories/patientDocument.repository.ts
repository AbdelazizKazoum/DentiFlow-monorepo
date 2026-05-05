import {
  PatientDocument,
  DocumentType,
} from "@domain/patient/entities/patientDocument";
import {axiosClient} from "@infrastructure/http/axiosClient";
import {BaseRepository} from "@infrastructure/http/BaseRepository";
import {AppError} from "@infrastructure/http/httpErrorHandler";
import {
  toDomain,
  toCreateDTO,
  toUpdateDTO,
} from "../mappers/patientDocument.mapper";
import type {
  PatientDocumentDTO,
  PatientDocumentListDTO,
} from "../dtos/patientDocument.dto";
import type {IPatientDocumentRepository} from "@domain/patient/repositories/patientDocumentRepository";
import type {CreatePatientDocumentInput} from "@domain/patient/commands/CreatePatientDocumentInput";
import type {UpdatePatientDocumentInput} from "@domain/patient/commands/UpdatePatientDocumentInput";

export class PatientDocumentHttpRepository
  extends BaseRepository
  implements IPatientDocumentRepository
{
  constructor(private readonly clinicId: string) {
    super();
  }

  private base(patientId: string): string {
    return `/api/v1/clinics/${this.clinicId}/patients/${patientId}/documents`;
  }

  private get clinicBase(): string {
    return `/api/v1/clinics/${this.clinicId}/patient-documents`;
  }

  async findById(id: string): Promise<PatientDocument | null> {
    try {
      const response = await this.execute(() =>
        axiosClient.get<PatientDocumentDTO>(`${this.clinicBase}/${id}`),
      );
      return toDomain(response.data);
    } catch (error) {
      if (error instanceof AppError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  }

  async create(document: CreatePatientDocumentInput): Promise<PatientDocument> {
    const dto = toCreateDTO(document);
    const response = await this.execute(() =>
      axiosClient.post<PatientDocumentDTO>(this.base(document.patientId), dto),
    );
    return toDomain(response.data);
  }

  async update(
    id: string,
    updates: UpdatePatientDocumentInput,
  ): Promise<PatientDocument> {
    const dto = toUpdateDTO(updates);
    const response = await this.execute(() =>
      axiosClient.put<PatientDocumentDTO>(`${this.clinicBase}/${id}`, dto),
    );
    return toDomain(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.execute(() => axiosClient.delete(`${this.clinicBase}/${id}`));
  }

  async findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientDocument[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientDocumentListDTO>(
        `/api/v1/clinics/${clinicId}/patients/${patientId}/documents`,
      ),
    );
    return response.data.documents.map(toDomain);
  }

  async findByPatientIdAndType(
    clinicId: string,
    patientId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientDocumentListDTO>(
        `/api/v1/clinics/${clinicId}/patients/${patientId}/documents`,
        {params: {type}},
      ),
    );
    return response.data.documents.map(toDomain);
  }

  async findByClinicId(clinicId: string): Promise<PatientDocument[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientDocumentListDTO>(
        `/api/v1/clinics/${clinicId}/patient-documents`,
      ),
    );
    return response.data.documents.map(toDomain);
  }

  async findByClinicIdAndType(
    clinicId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientDocumentListDTO>(
        `/api/v1/clinics/${clinicId}/patient-documents`,
        {params: {type}},
      ),
    );
    return response.data.documents.map(toDomain);
  }

  async findMedicalDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    const params: Record<string, string> = {type: DocumentType.MEDICAL};
    if (patientId) params.patientId = patientId;
    const response = await this.execute(() =>
      axiosClient.get<PatientDocumentListDTO>(
        `/api/v1/clinics/${clinicId}/patient-documents`,
        {params},
      ),
    );
    return response.data.documents.map(toDomain);
  }

  async findInsuranceDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    const params: Record<string, string> = {type: DocumentType.INSURANCE};
    if (patientId) params.patientId = patientId;
    const response = await this.execute(() =>
      axiosClient.get<PatientDocumentListDTO>(
        `/api/v1/clinics/${clinicId}/patient-documents`,
        {params},
      ),
    );
    return response.data.documents.map(toDomain);
  }

  async findGeneralDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    const params: Record<string, string> = {type: DocumentType.GENERAL};
    if (patientId) params.patientId = patientId;
    const response = await this.execute(() =>
      axiosClient.get<PatientDocumentListDTO>(
        `/api/v1/clinics/${clinicId}/patient-documents`,
        {params},
      ),
    );
    return response.data.documents.map(toDomain);
  }

  async searchByTitle(
    clinicId: string,
    searchTerm: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    const params: Record<string, string> = {search: searchTerm};
    if (patientId) params.patientId = patientId;
    const response = await this.execute(() =>
      axiosClient.get<PatientDocumentListDTO>(
        `/api/v1/clinics/${clinicId}/patient-documents`,
        {params},
      ),
    );
    return response.data.documents.map(toDomain);
  }

  async findMultipleByIds(ids: string[]): Promise<PatientDocument[]> {
    const response = await this.execute(() =>
      axiosClient.get<PatientDocumentListDTO>(`${this.clinicBase}`, {
        params: {ids: ids.join(",")},
      }),
    );
    return response.data.documents.map(toDomain);
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    await this.execute(() =>
      axiosClient.delete(`${this.clinicBase}`, {
        data: {ids},
      }),
    );
  }
}
