import {ActCatalog} from "../entities/act-catalog";

export interface CreateActCatalogInput {
  clinicId: string;
  code: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  defaultPrice: number;
  isActive?: boolean;
  icon?: string | null;
}

export interface UpdateActCatalogInput {
  code?: string;
  nameAr?: string;
  nameFr?: string;
  nameEn?: string;
  defaultPrice?: number;
  isActive?: boolean;
  icon?: string | null;
}

export interface ActCatalogListResponse {
  items: ActCatalog[];
  total: number;
}

export interface IActCatalogRepository {
  findById(id: string): Promise<ActCatalog | null>;
  listByClinic(input: {
    clinicId: string;
    page?: number;
    limit?: number;
  }): Promise<ActCatalogListResponse>;
  create(input: CreateActCatalogInput): Promise<ActCatalog>;
  update(id: string, input: UpdateActCatalogInput): Promise<ActCatalog>;
  delete(id: string): Promise<void>;
}
