import {ConflictException, Inject, Injectable} from "@nestjs/common";
import {Clinic} from "../../domain/entities/clinic";
import {IClinicRepository} from "../../domain/repositories/clinic-repository.interface";
import {Locale} from "../../domain/enums/locale.enum";
import {CLINIC_REPOSITORY} from "../../shared/constants/injection-tokens";

export interface CreateClinicInput {
  slug: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone?: string;
  locale?: Locale;
}

@Injectable()
export class CreateClinicUseCase {
  constructor(
    @Inject(CLINIC_REPOSITORY)
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async execute(input: CreateClinicInput): Promise<Clinic> {
    const existing = await this.clinicRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictException(
        `Clinic with slug "${input.slug}" already exists`,
      );
    }

    const clinic = new Clinic(
      "",
      input.slug,
      input.name,
      input.phone ?? null,
      input.email ?? null,
      input.address ?? null,
      input.timezone ?? "Africa/Algiers",
      input.locale ?? Locale.FR,
      true,
      new Date(),
      new Date(),
    );

    return this.clinicRepository.save(clinic);
  }
}
