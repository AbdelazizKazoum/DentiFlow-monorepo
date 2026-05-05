import {PatientInsurance} from "@domain/patient/entities/patientInsurance";
import type {
  PatientInsuranceDTO,
  CreatePatientInsuranceDTO,
  UpdatePatientInsuranceDTO,
} from "../dtos/patientInsurance.dto";
import type {CreatePatientInsuranceInput} from "@domain/patient/commands/CreatePatientInsuranceInput";
import type {UpdatePatientInsuranceInput} from "@domain/patient/commands/UpdatePatientInsuranceInput";

const emptyToUndefined = (v: string | undefined): string | undefined =>
  v === "" ? undefined : v;

// 🔹 API → Domain
export const toDomain = (dto: PatientInsuranceDTO): PatientInsurance =>
  new PatientInsurance(
    dto.id,
    dto.clinicId,
    dto.patientId,
    dto.insuranceProviderId,
    new Date(dto.createdAt),
    new Date(dto.updatedAt),
    dto.isActive,
    emptyToUndefined(dto.policyNumber),
    emptyToUndefined(dto.memberId),
  );

// 🔹 Domain → API (Create)
export const toCreateDTO = (
  input: CreatePatientInsuranceInput,
): CreatePatientInsuranceDTO => ({
  clinicId: input.clinicId,
  patientId: input.patientId,
  insuranceProviderId: input.insuranceProviderId,
  ...(input.policyNumber ? {policyNumber: input.policyNumber} : {}),
  ...(input.memberId ? {memberId: input.memberId} : {}),
  ...(input.isActive !== undefined ? {isActive: input.isActive} : {}),
});

// 🔹 Domain → API (Update)
export const toUpdateDTO = (
  input: UpdatePatientInsuranceInput,
): UpdatePatientInsuranceDTO => ({
  ...(input.policyNumber !== undefined
    ? {policyNumber: input.policyNumber ?? null}
    : {}),
  ...(input.memberId !== undefined ? {memberId: input.memberId ?? null} : {}),
  ...(input.isActive !== undefined ? {isActive: input.isActive} : {}),
});
