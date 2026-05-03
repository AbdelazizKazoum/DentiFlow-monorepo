import {BadRequestException, Inject, Injectable} from "@nestjs/common";
import {WorkingHours} from "../../domain/entities/working-hours";
import {IWorkingHoursRepository} from "../../domain/repositories/working-hours-repository.interface";
import {WORKING_HOURS_REPOSITORY} from "../../shared/constants/injection-tokens";

export interface WorkingHoursEntryInput {
  dayOfWeek: number;
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
}

@Injectable()
export class UpsertWorkingHoursUseCase {
  constructor(
    @Inject(WORKING_HOURS_REPOSITORY)
    private readonly workingHoursRepository: IWorkingHoursRepository,
  ) {}

  async execute(
    clinicId: string,
    entries: WorkingHoursEntryInput[],
  ): Promise<WorkingHours[]> {
    if (entries.length === 0) {
      throw new BadRequestException(
        "At least one working-hours entry is required",
      );
    }

    const domainEntries = entries.map(
      (e) =>
        new WorkingHours(
          "",
          clinicId,
          e.dayOfWeek,
          e.openTime ?? null,
          e.closeTime ?? null,
          e.isClosed,
        ),
    );

    return this.workingHoursRepository.upsertEntries(domainEntries);
  }
}
