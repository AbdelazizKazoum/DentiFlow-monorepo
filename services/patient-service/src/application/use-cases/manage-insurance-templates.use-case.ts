import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {
  CreateInsuranceTemplateInput,
  IInsuranceTemplateRepository,
  UpdateInsuranceTemplateInput,
} from "../../domain/repositories/insurance-template-repository.interface";
import {InsuranceTemplate} from "../../domain/entities/insurance-template";
import {INSURANCE_TEMPLATE_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManageInsuranceTemplatesUseCase {
  constructor(
    @Inject(INSURANCE_TEMPLATE_REPOSITORY)
    private readonly repository: IInsuranceTemplateRepository,
  ) {}

  create(input: CreateInsuranceTemplateInput): Promise<InsuranceTemplate> {
    return this.repository.create(input);
  }

  async getById(id: string): Promise<InsuranceTemplate> {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundException(`Insurance template \"${id}\" not found`);
    }
    return template;
  }

  list(
    providerId?: string,
    providerIds?: string[],
    search?: string,
  ): Promise<InsuranceTemplate[]> {
    if (search) {
      return this.repository.searchByName(search);
    }
    if (providerId) {
      return this.repository.findByProviderId(providerId);
    }
    if (providerIds?.length) {
      return this.repository.findByProviderIds(providerIds);
    }
    return this.repository.findAll();
  }

  update(
    id: string,
    updates: UpdateInsuranceTemplateInput,
  ): Promise<InsuranceTemplate> {
    return this.repository.update(id, updates);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
