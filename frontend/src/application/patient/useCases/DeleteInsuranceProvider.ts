import { IInsuranceProviderRepository } from "@/domain/patient/repositories/insuranceProviderRepository";

export class DeleteInsuranceProvider {
  constructor(private readonly repository: IInsuranceProviderRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
