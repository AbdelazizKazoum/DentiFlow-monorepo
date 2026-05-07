import { InsuranceProvider } from "@/domain/patient/entities/insuranceProvider";
import { IInsuranceProviderRepository } from "@/domain/patient/repositories/insuranceProviderRepository";

export class GetInsuranceProviders {
  constructor(private readonly repository: IInsuranceProviderRepository) {}

  async execute(clinicId: string): Promise<InsuranceProvider[]> {
    return this.repository.findByClinicId(clinicId);
  }
}
