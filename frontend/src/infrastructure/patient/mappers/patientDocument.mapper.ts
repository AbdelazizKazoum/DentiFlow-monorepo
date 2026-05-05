import { PatientDocument, DocumentType } from "@domain/patient/entities/patientDocument";
import type { PatientDocumentDTO, CreatePatientDocumentDTO, UpdatePatientDocumentDTO } from "../dtos/patientDocument.dto";
import type { CreatePatientDocumentInput } from "@domain/patient/commands/CreatePatientDocumentInput";
import type { UpdatePatientDocumentInput } from "@domain/patient/commands/UpdatePatientDocumentInput";

const emptyToUndefined = (v: string | undefined): string | undefined =>
  v === "" ? undefined : v;

// 🔹 API → Domain
export const toDomain = (dto: PatientDocumentDTO): PatientDocument =>
  new PatientDocument(
    dto.id,
    dto.clinicId,
    dto.patientId,
    dto.type as DocumentType,
    dto.fileUrl,
    new Date(dto.createdAt),
    emptyToUndefined(dto.title),
  );

// 🔹 Domain → API (Create)
export const toCreateDTO = (input: CreatePatientDocumentInput): CreatePatientDocumentDTO => ({
  clinicId: input.clinicId,
  patientId: input.patientId,
  type: input.type,
  fileUrl: input.fileUrl,
  ...(input.title ? { title: input.title } : {}),
});

// 🔹 Domain → API (Update)
export const toUpdateDTO = (input: UpdatePatientDocumentInput): UpdatePatientDocumentDTO => ({
  ...(input.type !== undefined ? { type: input.type } : {}),
  ...(input.title !== undefined ? { title: input.title ?? null } : {}),
  ...(input.fileUrl !== undefined ? { fileUrl: input.fileUrl } : {}),
});
