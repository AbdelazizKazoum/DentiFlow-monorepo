import {CreateInsuranceProviderInput} from "../commands/CreateInsuranceProviderInput";
import {UpdateInsuranceProviderInput} from "../commands/UpdateInsuranceProviderInput";
import {InsuranceProvider} from "../entities/insuranceProvider";

/**
 * Repository interface for InsuranceProvider entity operations.
 * Manages insurance companies/providers that patients can have coverage with.
 */
export interface IInsuranceProviderRepository {
  // Basic CRUD operations
  findById(id: string): Promise<InsuranceProvider | null>;
  create(provider: CreateInsuranceProviderInput): Promise<InsuranceProvider>;
  update(
    id: string,
    updates: UpdateInsuranceProviderInput,
  ): Promise<InsuranceProvider>;
  delete(id: string): Promise<void>;

  // Clinic-scoped queries
  findByClinicId(clinicId: string): Promise<InsuranceProvider[]>;
  findActiveByClinicId(clinicId: string): Promise<InsuranceProvider[]>;

  // Search operations
  findByName(clinicId: string, name: string): Promise<InsuranceProvider | null>;
  findByCode(clinicId: string, code: string): Promise<InsuranceProvider | null>;
  searchByName(
    clinicId: string,
    searchTerm: string,
  ): Promise<InsuranceProvider[]>;

  // Status management
  activate(id: string): Promise<InsuranceProvider>;
  deactivate(id: string): Promise<InsuranceProvider>;
}
