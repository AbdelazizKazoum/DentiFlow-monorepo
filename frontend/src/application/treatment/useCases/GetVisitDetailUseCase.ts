import type {GetVisitQuery} from "@/domain/treatment/queries/GetVisitQuery";
import type {Visit} from "@/domain/treatment/entities/Visit";
import type {TreatmentActRepository} from "@/domain/treatment/repositories/TreatmentActRepository";
import type {VisitRepository} from "@/domain/treatment/repositories/VisitRepository";

export class GetVisitDetailUseCase {
  constructor(
    private readonly visitRepository: VisitRepository,
    private readonly treatmentActRepository: TreatmentActRepository,
  ) {}

  async execute(query: GetVisitQuery): Promise<Visit> {
    const visit = await this.visitRepository.getById(query.visitId);

    if (visit.clinicId !== query.clinicId) {
      throw new Error("Visit does not belong to this clinic.");
    }

    const treatmentActs = await this.treatmentActRepository.getByVisitId(
      query.visitId,
    );

    return {...visit, treatmentActs};
  }
}
