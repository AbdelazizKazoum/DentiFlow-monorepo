import type {GetOpenVisitsQuery} from "@/domain/treatment/queries/GetOpenVisitsQuery";
import type {PaginatedVisits} from "@/domain/treatment/repositories/VisitRepository";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class GetOpenVisitsUseCase {
  constructor(private readonly visitRepository: VisitRepository) {}

  async execute(query: GetOpenVisitsQuery): Promise<PaginatedVisits> {
    const visits = await this.visitRepository.getOpenVisits(
      query.clinicId,
      query.doctorId,
    );
    const page = query.page ?? 1;
    const limit = query.limit ?? (visits.items.length || 25);
    const start = (page - 1) * limit;

    return {
      items: visits.items.slice(start, start + limit),
      total: visits.total,
    };
  }
}
