import { InsuranceProvider } from "@/domain/patient/entities/insuranceProvider";
import { IInsuranceProviderRepository } from "@/domain/patient/repositories/insuranceProviderRepository";
import type { UpdateInsuranceProviderInput } from "@/domain/patient/commands/UpdateInsuranceProviderInput";

export class UpdateInsuranceProvider {
  constructor(private readonly repository: IInsuranceProviderRepository) {}

  async execute(
    id: string,
    input: UpdateInsuranceProviderInput,
  ): Promise<InsuranceProvider> {
    return this.repository.update(id, input);
  }
}
