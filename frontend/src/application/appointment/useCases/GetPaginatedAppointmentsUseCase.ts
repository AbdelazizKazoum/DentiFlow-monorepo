import type {GetAppointmentsQuery} from "@/domain/appointment/queries/GetAppointmentsQuery";
import type {
  AppointmentRepository,
  PaginatedAppointments,
} from "@/domain/appointment/repositories/AppointmentRepository";

export class GetPaginatedAppointmentsUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(query: GetAppointmentsQuery): Promise<PaginatedAppointments> {
    return this.repository.getPaginated(query);
  }
}
