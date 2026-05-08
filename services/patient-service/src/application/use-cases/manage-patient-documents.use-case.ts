import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {
  CreatePatientDocumentInput,
  IPatientDocumentRepository,
  UpdatePatientDocumentInput,
} from "../../domain/repositories/patient-document-repository.interface";
import {PatientDocument} from "../../domain/entities/patient-document";
import {DocumentType} from "../../domain/enums/document-type.enum";
import {PATIENT_DOCUMENT_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManagePatientDocumentsUseCase {
  constructor(
    @Inject(PATIENT_DOCUMENT_REPOSITORY)
    private readonly repository: IPatientDocumentRepository,
  ) {}

  create(input: CreatePatientDocumentInput): Promise<PatientDocument> {
    return this.repository.create(input);
  }

  async getById(id: string): Promise<PatientDocument> {
    const document = await this.repository.findById(id);
    if (!document) {
      throw new NotFoundException(`Patient document \"${id}\" not found`);
    }
    return document;
  }

  listByPatient(
    clinicId: string,
    patientId: string,
    type?: DocumentType,
  ): Promise<PatientDocument[]> {
    if (type) {
      return this.repository.findByPatientIdAndType(clinicId, patientId, type);
    }
    return this.repository.findByPatientId(clinicId, patientId);
  }

  listByClinic(
    clinicId: string,
    type?: DocumentType,
    patientId?: string,
    search?: string,
  ): Promise<PatientDocument[]> {
    if (search) {
      return this.repository.searchByTitle(clinicId, search, patientId);
    }
    if (type === DocumentType.MEDICAL) {
      return this.repository.findMedicalDocuments(clinicId, patientId);
    }
    if (type === DocumentType.INSURANCE) {
      return this.repository.findInsuranceDocuments(clinicId, patientId);
    }
    if (type === DocumentType.GENERAL) {
      return this.repository.findGeneralDocuments(clinicId, patientId);
    }
    if (type) {
      return this.repository.findByClinicIdAndType(clinicId, type);
    }
    return this.repository.findByClinicId(clinicId);
  }

  update(
    id: string,
    updates: UpdatePatientDocumentInput,
  ): Promise<PatientDocument> {
    return this.repository.update(id, updates);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  deleteMany(ids: string[]): Promise<void> {
    return this.repository.deleteMultiple(ids);
  }
}
