import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {AppointmentRepository} from "@/domain/appointment/repositories/AppointmentRepository";

export class GetCalendarViewUseCase {
  private cache = new Map<string, Appointment[]>();

  constructor(private readonly repository: AppointmentRepository) {}

  async execute(
    clinicId: string,
    start: Date,
    end: Date,
    doctorId?: string,
  ): Promise<Appointment[]> {
    const key = [
      clinicId,
      start.toISOString(),
      end.toISOString(),
      doctorId ?? "all",
    ].join(":");

    const cached = this.cache.get(key);
    if (cached) return cached;

    const appointments = await this.repository.getByRange(
      clinicId,
      start,
      end,
      doctorId,
    );
    this.cache.set(key, appointments);
    return appointments;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
