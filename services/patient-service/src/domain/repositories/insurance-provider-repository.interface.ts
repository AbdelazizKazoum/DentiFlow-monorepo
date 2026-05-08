import {InsuranceProvider} from "../entities/insurance-provider";

export interface CreateInsuranceProviderInput {
  clinicId: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

export interface UpdateInsuranceProviderInput {
  name?: string;
  code?: string | null;
  isActive?: boolean;
}

export interface IInsuranceProviderRepository {
  findById(id: string): Promise<InsuranceProvider | null>;
  create(provider: CreateInsuranceProviderInput): Promise<InsuranceProvider>;
  update(
    id: string,
    updates: UpdateInsuranceProviderInput,
  ): Promise<InsuranceProvider>;
  delete(id: string): Promise<void>;
  findByClinicId(clinicId: string): Promise<InsuranceProvider[]>;
  findActiveByClinicId(clinicId: string): Promise<InsuranceProvider[]>;
  findByName(clinicId: string, name: string): Promise<InsuranceProvider | null>;
  findByCode(clinicId: string, code: string): Promise<InsuranceProvider | null>;
  searchByName(
    clinicId: string,
    searchTerm: string,
  ): Promise<InsuranceProvider[]>;
  activate(id: string): Promise<InsuranceProvider>;
  deactivate(id: string): Promise<InsuranceProvider>;
}
