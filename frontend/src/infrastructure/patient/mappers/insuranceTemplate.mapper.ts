import {InsuranceTemplate} from "@domain/patient/entities/insuranceTemplate";
import type {
  InsuranceTemplateDTO,
  CreateInsuranceTemplateDTO,
  UpdateInsuranceTemplateDTO,
} from "../dtos/insuranceTemplate.dto";
import type {CreateInsuranceTemplateInput} from "@domain/patient/commands/CreateInsuranceTemplateInput";
import type {UpdateInsuranceTemplateInput} from "@domain/patient/commands/UpdateInsuranceTemplateInput";

// 🔹 API → Domain
export const toDomain = (dto: InsuranceTemplateDTO): InsuranceTemplate =>
  new InsuranceTemplate(
    dto.id,
    dto.insuranceProviderId,
    dto.name,
    dto.fileUrl,
    new Date(dto.createdAt),
  );

// 🔹 Domain → API (Create)
export const toCreateDTO = (
  input: CreateInsuranceTemplateInput,
): CreateInsuranceTemplateDTO => ({
  insuranceProviderId: input.insuranceProviderId,
  name: input.name,
  fileUrl: input.fileUrl,
});

// 🔹 Domain → API (Update)
export const toUpdateDTO = (
  input: UpdateInsuranceTemplateInput,
): UpdateInsuranceTemplateDTO => ({
  ...(input.name !== undefined ? {name: input.name} : {}),
  ...(input.fileUrl !== undefined ? {fileUrl: input.fileUrl} : {}),
});
