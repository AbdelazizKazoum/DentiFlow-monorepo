export interface InsuranceTemplateDTO {
  id: string;
  insuranceProviderId: string;
  name: string;
  fileUrl: string;
  createdAt: string;
}

export interface InsuranceTemplateListDTO {
  templates: InsuranceTemplateDTO[];
}

export interface CreateInsuranceTemplateDTO {
  insuranceProviderId: string;
  name: string;
  fileUrl: string;
}

export interface UpdateInsuranceTemplateDTO {
  name?: string;
  fileUrl?: string;
}
