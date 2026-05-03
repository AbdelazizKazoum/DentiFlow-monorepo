import {Inject, Injectable} from "@nestjs/common";
import {WorkingHours} from "../../domain/entities/working-hours";
import {IWorkingHoursRepository} from "../../domain/repositories/working-hours-repository.interface";
import {WORKING_HOURS_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class GetWorkingHoursUseCase {
  constructor(
    @Inject(WORKING_HOURS_REPOSITORY)
    private readonly workingHoursRepository: IWorkingHoursRepository,
  ) {}

  async execute(clinicId: string): Promise<WorkingHours[]> {
    return this.workingHoursRepository.findByClinic(clinicId);
  }
}
