import {
  PatientDocument,
  DocumentType,
} from "@/domain/patient/entities/patientDocument";
import { IPatientDocumentRepository } from "@/domain/patient/repositories/patientDocumentRepository";
import type { CreatePatientDocumentInput } from "@/domain/patient/commands/CreatePatientDocumentInput";
import type { UpdatePatientDocumentInput } from "@/domain/patient/commands/UpdatePatientDocumentInput";

export class InMemoryPatientDocumentRepository implements IPatientDocumentRepository {
  private store: PatientDocument[] = [];

  async findById(id: string): Promise<PatientDocument | null> {
    return this.store.find((d) => d.id === id) ?? null;
  }

  async create(input: CreatePatientDocumentInput): Promise<PatientDocument> {
    const doc = new PatientDocument(
      String(Date.now()),
      input.clinicId,
      input.patientId,
      input.type,
      input.fileUrl,
      new Date(),
      input.title,
    );
    this.store.push(doc);
    return doc;
  }

  async update(
    id: string,
    updates: UpdatePatientDocumentInput,
  ): Promise<PatientDocument> {
    const idx = this.store.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`PatientDocument ${id} not found`);
    const existing = this.store[idx];
    const updated = new PatientDocument(
      existing.id,
      existing.clinicId,
      existing.patientId,
      updates.type ?? existing.type,
      updates.fileUrl ?? existing.fileUrl,
      existing.createdAt,
      updates.title ?? existing.title,
    );
    this.store[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store = this.store.filter((d) => d.id !== id);
  }

  async findByPatientId(
    clinicId: string,
    patientId: string,
  ): Promise<PatientDocument[]> {
    return this.store.filter(
      (d) => d.clinicId === clinicId && d.patientId === patientId,
    );
  }

  async findByPatientIdAndType(
    clinicId: string,
    patientId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]> {
    return this.store.filter(
      (d) =>
        d.clinicId === clinicId && d.patientId === patientId && d.type === type,
    );
  }

  async findByClinicId(clinicId: string): Promise<PatientDocument[]> {
    return this.store.filter((d) => d.clinicId === clinicId);
  }

  async findByClinicIdAndType(
    clinicId: string,
    type: DocumentType,
  ): Promise<PatientDocument[]> {
    return this.store.filter((d) => d.clinicId === clinicId && d.type === type);
  }

  async findMedicalDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    return this.store.filter(
      (d) =>
        d.clinicId === clinicId &&
        d.type === DocumentType.MEDICAL &&
        (!patientId || d.patientId === patientId),
    );
  }

  async findInsuranceDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    return this.store.filter(
      (d) =>
        d.clinicId === clinicId &&
        d.type === DocumentType.INSURANCE &&
        (!patientId || d.patientId === patientId),
    );
  }

  async findGeneralDocuments(
    clinicId: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    return this.store.filter(
      (d) =>
        d.clinicId === clinicId &&
        d.type === DocumentType.GENERAL &&
        (!patientId || d.patientId === patientId),
    );
  }

  async searchByTitle(
    clinicId: string,
    searchTerm: string,
    patientId?: string,
  ): Promise<PatientDocument[]> {
    return this.store.filter(
      (d) =>
        d.clinicId === clinicId &&
        (d.title ?? "").toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!patientId || d.patientId === patientId),
    );
  }

  async findMultipleByIds(ids: string[]): Promise<PatientDocument[]> {
    return this.store.filter((d) => ids.includes(d.id));
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    this.store = this.store.filter((d) => !ids.includes(d.id));
  }
}
