import { InsuranceTemplate } from "@/domain/patient/entities/insuranceTemplate";
import { IInsuranceTemplateRepository } from "@/domain/patient/repositories/insuranceTemplateRepository";

export class GetInsuranceTemplates {
  constructor(private readonly repository: IInsuranceTemplateRepository) {}

  async execute(providerIds: string[]): Promise<InsuranceTemplate[]> {
    return this.repository.findByProviderIds(providerIds);
  }
}
