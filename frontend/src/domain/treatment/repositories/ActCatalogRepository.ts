import type {GetActCatalogQuery} from "../queries/GetActCatalogQuery";
import type {ActCatalog} from "../entities/ActCatalog";

export interface PaginatedActCatalog {
  items: ActCatalog[];
  total: number;
}

export interface ActCatalogRepository {
  getById(id: string): Promise<ActCatalog>;
  getByClinic(clinicId: string, locale: string): Promise<ActCatalog[]>;
  getPaginated(query: GetActCatalogQuery): Promise<PaginatedActCatalog>;
  save(catalog: Partial<ActCatalog>): Promise<ActCatalog>;
  update(id: string, updates: Partial<ActCatalog>): Promise<ActCatalog>;
  delete(id: string): Promise<void>;
}
