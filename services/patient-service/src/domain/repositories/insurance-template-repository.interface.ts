import {InsuranceTemplate} from "../entities/insurance-template";

export interface CreateInsuranceTemplateInput {
  insuranceProviderId: string;
  name: string;
  fileUrl: string;
}

export interface UpdateInsuranceTemplateInput {
  name?: string;
  fileUrl?: string;
}

export interface IInsuranceTemplateRepository {
  findById(id: string): Promise<InsuranceTemplate | null>;
  create(template: CreateInsuranceTemplateInput): Promise<InsuranceTemplate>;
  update(
    id: string,
    updates: UpdateInsuranceTemplateInput,
  ): Promise<InsuranceTemplate>;
  delete(id: string): Promise<void>;
  findByProviderId(providerId: string): Promise<InsuranceTemplate[]>;
  findByProviderIds(providerIds: string[]): Promise<InsuranceTemplate[]>;
  findByName(
    providerId: string,
    name: string,
  ): Promise<InsuranceTemplate | null>;
  searchByName(searchTerm: string): Promise<InsuranceTemplate[]>;
  findAll(): Promise<InsuranceTemplate[]>;
}
