import {CreateInsuranceTemplateInput} from "../commands/CreateInsuranceTemplateInput";
import {UpdateInsuranceTemplateInput} from "../commands/UpdateInsuranceTemplateInput";
import {InsuranceTemplate} from "../entities/insuranceTemplate";

/**
 * Repository interface for InsuranceTemplate entity operations.
 * Manages templates/forms provided by insurance providers for claims processing.
 */
export interface IInsuranceTemplateRepository {
  // Basic CRUD operations
  findById(id: string): Promise<InsuranceTemplate | null>;
  create(template: CreateInsuranceTemplateInput): Promise<InsuranceTemplate>;
  update(
    id: string,
    updates: UpdateInsuranceTemplateInput,
  ): Promise<InsuranceTemplate>;
  delete(id: string): Promise<void>;

  // Provider-scoped queries
  findByProviderId(providerId: string): Promise<InsuranceTemplate[]>;
  findByProviderIds(providerIds: string[]): Promise<InsuranceTemplate[]>;

  // Search operations
  findByName(
    providerId: string,
    name: string,
  ): Promise<InsuranceTemplate | null>;
  searchByName(searchTerm: string): Promise<InsuranceTemplate[]>;

  // Bulk operations
  findAll(): Promise<InsuranceTemplate[]>;
}
