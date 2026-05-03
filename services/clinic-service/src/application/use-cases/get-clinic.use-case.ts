import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {Clinic} from "../../domain/entities/clinic";
import {IClinicRepository} from "../../domain/repositories/clinic-repository.interface";
import {CLINIC_REPOSITORY} from "../../shared/constants/injection-tokens";

@Injectable()
export class GetClinicUseCase {
  constructor(
    @Inject(CLINIC_REPOSITORY)
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(id: string): Promise<Clinic> {
    const clinic = await this.clinicRepository.findById(id);
    if (!clinic) {
      throw new NotFoundException(`Clinic "${id}" not found`);
    }
    return clinic;
  }
}
