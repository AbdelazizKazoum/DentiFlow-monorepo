import { InsuranceProvider } from "@domain/patient/entities/insuranceProvider";
import type { InsuranceProviderDTO, CreateInsuranceProviderDTO, UpdateInsuranceProviderDTO } from "../dtos/insuranceProvider.dto";
import type { CreateInsuranceProviderInput } from "@domain/patient/commands/CreateInsuranceProviderInput";
import type { UpdateInsuranceProviderInput } from "@domain/patient/commands/UpdateInsuranceProviderInput";

const emptyToUndefined = (v: string | undefined): string | undefined =>
  v === "" ? undefined : v;

// 🔹 API → Domain
export const toDomain = (dto: InsuranceProviderDTO): InsuranceProvider =>
  new InsuranceProvider(
    dto.id,
    dto.clinicId,
    dto.name,
    new Date(dto.createdAt),
    new Date(dto.updatedAt),
    dto.isActive,
    emptyToUndefined(dto.code),
  );

// 🔹 Domain → API (Create)
export const toCreateDTO = (input: CreateInsuranceProviderInput): CreateInsuranceProviderDTO => ({
  clinicId: input.clinicId,
  name: input.name,
  ...(input.code ? { code: input.code } : {}),
  ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
});

// 🔹 Domain → API (Update)
export const toUpdateDTO = (input: UpdateInsuranceProviderInput): UpdateInsuranceProviderDTO => ({
  ...(input.name !== undefined ? { name: input.name } : {}),
  ...(input.code !== undefined ? { code: input.code ?? null } : {}),
  ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
});
