import { Patient, PatientGender, PatientStatus } from "@domain/patient/entities/patient";
import type { PatientDTO, PatientListItemDTO, CreatePatientDTO, UpdatePatientDTO } from "../dtos/patient.dto";
import type { CreatePatientInput } from "@domain/patient/commands/CreatePatientInput";
import type { UpdatePatientInput } from "@domain/patient/commands/UpdatePatientInput";
import type { PatientListItem } from "@domain/patient/queries/patientQueries";

const emptyToUndefined = (v: string | undefined): string | undefined =>
  v === "" ? undefined : v;

const toDate = (v: string | undefined): Date | undefined =>
  v ? new Date(v) : undefined;

// 🔹 API → Domain (full patient)
export const toDomain = (dto: PatientDTO): Patient =>
  new Patient(
    dto.id,
    dto.clinicId,
    dto.firstName,
    dto.lastName,
    new Date(dto.createdAt),
    new Date(dto.updatedAt),
    dto.status as PatientStatus,
    emptyToUndefined(dto.userId),
    emptyToUndefined(dto.phone),
    emptyToUndefined(dto.email),
    toDate(dto.dateOfBirth),
    dto.gender as PatientGender | undefined,
    emptyToUndefined(dto.address),
    emptyToUndefined(dto.notes),
    emptyToUndefined(dto.allergies),
    emptyToUndefined(dto.chronicConditions),
    emptyToUndefined(dto.currentMedications),
    emptyToUndefined(dto.medicalNotes),
    toDate(dto.deletedAt),
    emptyToUndefined(dto.cnie),
  );

// 🔹 API → Domain (list item)
export const toListItemDomain = (dto: PatientListItemDTO): PatientListItem => ({
  id: dto.id,
  clinicId: dto.clinicId,
  firstName: dto.firstName,
  lastName: dto.lastName,
  fullName: dto.fullName,
  status: dto.status,
  phone: emptyToUndefined(dto.phone),
  email: emptyToUndefined(dto.email),
  dateOfBirth: toDate(dto.dateOfBirth),
  gender: dto.gender,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});

// 🔹 Domain → API (Create)
export const toCreateDTO = (input: CreatePatientInput): CreatePatientDTO => ({
  clinicId: input.clinicId,
  firstName: input.firstName,
  lastName: input.lastName,
  ...(input.userId ? { userId: input.userId } : {}),
  ...(input.cnie ? { cnie: input.cnie } : {}),
  ...(input.phone ? { phone: input.phone } : {}),
  ...(input.email ? { email: input.email } : {}),
  ...(input.dateOfBirth ? { dateOfBirth: input.dateOfBirth.toISOString() } : {}),
  ...(input.gender ? { gender: input.gender } : {}),
  ...(input.address ? { address: input.address } : {}),
  ...(input.notes ? { notes: input.notes } : {}),
  ...(input.allergies ? { allergies: input.allergies } : {}),
  ...(input.chronicConditions ? { chronicConditions: input.chronicConditions } : {}),
  ...(input.currentMedications ? { currentMedications: input.currentMedications } : {}),
  ...(input.medicalNotes ? { medicalNotes: input.medicalNotes } : {}),
  ...(input.status ? { status: input.status } : {}),
});

// 🔹 Domain → API (Update)
export const toUpdateDTO = (input: UpdatePatientInput): UpdatePatientDTO => ({
  ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
  ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
  ...(input.cnie !== undefined ? { cnie: input.cnie ?? null } : {}),
  ...(input.phone !== undefined ? { phone: input.phone ?? null } : {}),
  ...(input.email !== undefined ? { email: input.email ?? null } : {}),
  ...(input.dateOfBirth !== undefined
    ? { dateOfBirth: input.dateOfBirth ? input.dateOfBirth.toISOString() : null }
    : {}),
  ...(input.gender !== undefined ? { gender: input.gender ?? null } : {}),
  ...(input.address !== undefined ? { address: input.address ?? null } : {}),
  ...(input.notes !== undefined ? { notes: input.notes ?? null } : {}),
  ...(input.allergies !== undefined ? { allergies: input.allergies ?? null } : {}),
  ...(input.chronicConditions !== undefined
    ? { chronicConditions: input.chronicConditions ?? null }
    : {}),
  ...(input.currentMedications !== undefined
    ? { currentMedications: input.currentMedications ?? null }
    : {}),
  ...(input.medicalNotes !== undefined ? { medicalNotes: input.medicalNotes ?? null } : {}),
  ...(input.status !== undefined ? { status: input.status } : {}),
});
