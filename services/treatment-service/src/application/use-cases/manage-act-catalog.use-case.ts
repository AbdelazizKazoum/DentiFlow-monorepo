import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {ActCatalog} from "../../domain/entities/act-catalog";
import {
  ActCatalogListResponse,
  CreateActCatalogInput,
  IActCatalogRepository,
  UpdateActCatalogInput,
} from "../../domain/repositories/act-catalog-repository.interface";
import {ACT_CATALOG_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class ManageActCatalogUseCase {
  constructor(
    @Inject(ACT_CATALOG_REPOSITORY)
    private readonly catalog: IActCatalogRepository,
  ) {}

  list(input: {
    clinicId: string;
    page?: number;
    limit?: number;
  }): Promise<ActCatalogListResponse> {
    return this.catalog.listByClinic(input);
  }

  async getById(id: string): Promise<ActCatalog> {
    const item = await this.catalog.findById(id);
    if (!item) throw new NotFoundException(`Act catalog "${id}" not found`);
    return item;
  }

  create(input: CreateActCatalogInput): Promise<ActCatalog> {
    return this.catalog.create(input);
  }

  update(id: string, input: UpdateActCatalogInput): Promise<ActCatalog> {
    return this.catalog.update(id, input);
  }

  delete(id: string): Promise<void> {
    return this.catalog.delete(id);
  }
}
