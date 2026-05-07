import { InsuranceTemplate } from "@/domain/patient/entities/insuranceTemplate";
import { IInsuranceTemplateRepository } from "@/domain/patient/repositories/insuranceTemplateRepository";
import type { CreateInsuranceTemplateInput } from "@/domain/patient/commands/CreateInsuranceTemplateInput";

export class CreateInsuranceTemplate {
  constructor(private readonly repository: IInsuranceTemplateRepository) {}

  async execute(
    input: CreateInsuranceTemplateInput,
  ): Promise<InsuranceTemplate> {
    return this.repository.create(input);
  }
}
