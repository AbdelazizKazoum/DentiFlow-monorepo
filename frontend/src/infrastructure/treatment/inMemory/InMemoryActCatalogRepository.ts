import type {GetActCatalogQuery} from "@/domain/treatment/queries/GetActCatalogQuery";
import type {ActCatalog} from "@/domain/treatment/entities/ActCatalog";
import type {
  ActCatalogRepository,
  PaginatedActCatalog,
} from "@/domain/treatment/repositories/ActCatalogRepository";
import {treatmentMemoryStore} from "./treatmentMemoryStore";

function cloneCatalog(item: ActCatalog): ActCatalog {
  return {
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export class InMemoryActCatalogRepository implements ActCatalogRepository {
  async getById(id: string): Promise<ActCatalog> {
    const item = treatmentMemoryStore.actCatalog.find(
      (catalog) => catalog.id === id,
    );

    if (!item) {
      throw new Error(`Act catalog entry with id "${id}" not found.`);
    }

    return cloneCatalog(item);
  }

  async getByClinic(clinicId: string, locale: string): Promise<ActCatalog[]> {
    void locale;
    return treatmentMemoryStore.actCatalog
      .filter((item) => item.clinicId === clinicId && item.isActive)
      .map(cloneCatalog);
  }

  async getPaginated(
    query: GetActCatalogQuery,
  ): Promise<PaginatedActCatalog> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const matching = treatmentMemoryStore.actCatalog.filter(
      (item) => item.clinicId === query.clinicId && item.isActive,
    );
    const start = (page - 1) * limit;

    return {
      items: matching.slice(start, start + limit).map(cloneCatalog),
      total: matching.length,
    };
  }

  async save(catalog: Partial<ActCatalog>): Promise<ActCatalog> {
    const created: ActCatalog = {
      id: catalog.id ?? `act-catalog-${Date.now()}`,
      clinicId: catalog.clinicId ?? "",
      code: catalog.code ?? "",
      nameAr: catalog.nameAr ?? catalog.nameEn ?? "",
      nameFr: catalog.nameFr ?? catalog.nameEn ?? "",
      nameEn: catalog.nameEn ?? "",
      defaultPrice: catalog.defaultPrice ?? 0,
      isActive: catalog.isActive ?? true,
      createdAt: catalog.createdAt ?? new Date(),
      updatedAt: catalog.updatedAt ?? new Date(),
    };

    treatmentMemoryStore.actCatalog.push(created);
    return cloneCatalog(created);
  }

  async update(
    id: string,
    updates: Partial<ActCatalog>,
  ): Promise<ActCatalog> {
    const index = treatmentMemoryStore.actCatalog.findIndex(
      (item) => item.id === id,
    );

    if (index === -1) {
      throw new Error(`Act catalog entry with id "${id}" not found.`);
    }

    const updated = {
      ...treatmentMemoryStore.actCatalog[index],
      ...updates,
      id,
      updatedAt: new Date(),
    };

    treatmentMemoryStore.actCatalog[index] = updated;
    return cloneCatalog(updated);
  }

  async delete(id: string): Promise<void> {
    await this.update(id, {isActive: false});
  }
}
