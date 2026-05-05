export interface InsuranceProviderDTO {
  id: string;
  clinicId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  code?: string;
}

export interface InsuranceProviderListDTO {
  providers: InsuranceProviderDTO[];
}

export interface CreateInsuranceProviderDTO {
  clinicId: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

export interface UpdateInsuranceProviderDTO {
  name?: string;
  code?: string | null;
  isActive?: boolean;
}
