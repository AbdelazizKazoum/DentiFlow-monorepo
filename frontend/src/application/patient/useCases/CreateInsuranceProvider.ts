import { InsuranceProvider } from "@/domain/patient/entities/insuranceProvider";
import { IInsuranceProviderRepository } from "@/domain/patient/repositories/insuranceProviderRepository";
import type { CreateInsuranceProviderInput } from "@/domain/patient/commands/CreateInsuranceProviderInput";

export class CreateInsuranceProvider {
  constructor(private readonly repository: IInsuranceProviderRepository) {}

  async execute(
    input: CreateInsuranceProviderInput,
  ): Promise<InsuranceProvider> {
    return this.repository.create(input);
  }
}
