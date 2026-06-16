import type {GetActCatalogQuery} from "@/domain/treatment/queries/GetActCatalogQuery";
import type {ActCatalog} from "@/domain/treatment/entities/ActCatalog";
import type {ActCatalogRepository} from "@/domain/treatment/repositories/ActCatalogRepository";

export class GetActCatalogUseCase {
  constructor(private readonly actCatalogRepository: ActCatalogRepository) {}

  async execute(query: GetActCatalogQuery): Promise<ActCatalog[]> {
    const catalog = query.page
      ? (await this.actCatalogRepository.getPaginated(query)).items
      : await this.actCatalogRepository.getByClinic(query.clinicId, query.locale);

    return catalog.filter((item) => item.isActive);
  }
}
