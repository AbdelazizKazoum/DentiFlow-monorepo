export interface ActCatalogDTO {
  id: string;
  clinic_id: string;
  code: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  default_price: number;
  is_active: boolean;
  icon?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActCatalogListDTO {
  items?: ActCatalogDTO[];
  act_catalog?: ActCatalogDTO[];
  total?: number;
}

export interface CreateActCatalogDTO {
  clinic_id: string;
  code: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  default_price: number;
  is_active?: boolean;
  icon?: string;
}

export interface UpdateActCatalogDTO {
  code?: string;
  name_ar?: string;
  name_fr?: string;
  name_en?: string;
  default_price?: number;
  is_active?: boolean;
  icon?: string | null;
}
