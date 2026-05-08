import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {
  CreateInsuranceProviderInput,
  IInsuranceProviderRepository,
  UpdateInsuranceProviderInput,
} from "../../domain/repositories/insurance-provider-repository.interface";
import {InsuranceProvider} from "../../domain/entities/insurance-provider";
import {INSURANCE_PROVIDER_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManageInsuranceProvidersUseCase {
  constructor(
    @Inject(INSURANCE_PROVIDER_REPOSITORY)
    private readonly repository: IInsuranceProviderRepository,
  ) {}

  create(input: CreateInsuranceProviderInput): Promise<InsuranceProvider> {
    return this.repository.create(input);
  }

  async getById(id: string): Promise<InsuranceProvider> {
    const provider = await this.repository.findById(id);
    if (!provider) {
      throw new NotFoundException(`Insurance provider \"${id}\" not found`);
    }
    return provider;
  }

  list(
    clinicId: string,
    onlyActive?: boolean,
    search?: string,
  ): Promise<InsuranceProvider[]> {
    if (search) {
      return this.repository.searchByName(clinicId, search);
    }
    if (onlyActive) {
      return this.repository.findActiveByClinicId(clinicId);
    }
    return this.repository.findByClinicId(clinicId);
  }

  update(
    id: string,
    updates: UpdateInsuranceProviderInput,
  ): Promise<InsuranceProvider> {
    return this.repository.update(id, updates);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  activate(id: string): Promise<InsuranceProvider> {
    return this.repository.activate(id);
  }

  deactivate(id: string): Promise<InsuranceProvider> {
    return this.repository.deactivate(id);
  }
}
