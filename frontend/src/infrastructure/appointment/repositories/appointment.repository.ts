import type {MoveAppointmentCommand} from "@/domain/appointment/commands/MoveAppointmentCommand";
import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {GetAppointmentsQuery} from "@/domain/appointment/queries/GetAppointmentsQuery";
import type {
  AppointmentRepository,
  PaginatedAppointments,
} from "@/domain/appointment/repositories/AppointmentRepository";
import {axiosClient} from "@/infrastructure/http/axiosClient";
import {BaseRepository} from "@/infrastructure/http/BaseRepository";
import type {AppointmentDTO, AppointmentListDTO} from "../dtos";
import {appointmentToDTO, appointmentToDomain} from "../mappers";

export class AppointmentHttpRepository
  extends BaseRepository
  implements AppointmentRepository
{
  private getBase(clinicId: string): string {
    return `/api/v1/clinics/${clinicId}/appointments`;
  }

  async getById(id: string): Promise<Appointment> {
    const response = await this.execute(() =>
      axiosClient.get<AppointmentDTO>(`/api/v1/appointments/${id}`),
    );
    return appointmentToDomain(response.data);
  }

  async getByRange(
    clinicId: string,
    start: Date,
    end: Date,
    doctorId?: string,
  ): Promise<Appointment[]> {
    const response = await this.execute(() =>
      axiosClient.get<AppointmentListDTO>(this.getBase(clinicId), {
        params: {
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          doctor_id: doctorId,
        },
      }),
    );
    return (response.data.appointments ?? []).map(appointmentToDomain);
  }

  async getPaginated(
    query: GetAppointmentsQuery,
  ): Promise<PaginatedAppointments> {
    const response = await this.execute(() =>
      axiosClient.get<AppointmentListDTO>(this.getBase(query.clinicId), {
        params: {
          page: query.page,
          limit: query.limit,
          start_date: query.startDate?.toISOString(),
          end_date: query.endDate?.toISOString(),
          doctor_id: query.doctorId,
          status: query.status,
        },
      }),
    );

    return {
      items: (response.data.appointments ?? []).map(appointmentToDomain),
      total: response.data.total ?? 0,
    };
  }

  async save(appointment: Partial<Appointment>): Promise<Appointment> {
    const dto = appointmentToDTO(appointment);
    const base = this.getBase(appointment.clinicId ?? "");

    const response = await this.execute(() =>
      appointment.id
        ? axiosClient.put<AppointmentDTO>(`${base}/${appointment.id}`, dto)
        : axiosClient.post<AppointmentDTO>(base, dto),
    );

    return appointmentToDomain(response.data);
  }

  async updateTiming(command: MoveAppointmentCommand): Promise<void> {
    await this.execute(() =>
      axiosClient.patch(
        `/api/v1/appointments/${command.appointmentId}/timing`,
        {
          doctor_id: command.doctorId,
          doctor_name: command.doctorName,
          new_start_at: command.newStartAt.toISOString(),
          new_end_at: command.newEndAt.toISOString(),
        },
      ),
    );
  }

  async checkConflicts(
    doctorId: string,
    start: Date,
    end: Date,
  ): Promise<boolean> {
    const response = await this.execute(() =>
      axiosClient.get<{has_conflict: boolean}>(
        "/api/v1/appointments/conflicts",
        {
          params: {
            doctor_id: doctorId,
            start_at: start.toISOString(),
            end_at: end.toISOString(),
            exclude_status: "CANCELLED",
          },
        },
      ),
    );
    return response.data.has_conflict;
  }
}
