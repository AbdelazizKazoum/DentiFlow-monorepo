import type {Visit, VisitStatus} from "@/domain/treatment/entities/Visit";
import type {
  PaginatedVisits,
  VisitRepository,
} from "@/domain/treatment/repositories/VisitRepository";
import {axiosClient} from "@/infrastructure/http/axiosClient";
import {BaseRepository} from "@/infrastructure/http/BaseRepository";
import type {VisitDTO, VisitListDTO} from "../dtos";
import {
  assignAssistantToDTO,
  confirmVisitToDTO,
  openVisitToDTO,
  visitToDomain,
} from "../mappers";

export class VisitHttpRepository
  extends BaseRepository
  implements VisitRepository
{
  private getBase(clinicId: string): string {
    return `/api/v1/clinics/${clinicId}/treatment/visits`;
  }

  async getById(id: string): Promise<Visit> {
    const response = await this.execute(() =>
      axiosClient.get<VisitDTO>(`/api/v1/treatment/visits/${id}`),
    );
    return visitToDomain(response.data);
  }

  async getByAppointmentId(appointmentId: string): Promise<Visit | null> {
    const response = await this.execute(() =>
      axiosClient.get<VisitDTO | null>(
        `/api/v1/treatment/visits/by-appointment/${appointmentId}`,
      ),
    );
    return response.data ? visitToDomain(response.data) : null;
  }

  async getOpenVisits(
    clinicId: string,
    doctorId?: string,
  ): Promise<PaginatedVisits> {
    const response = await this.execute(() =>
      axiosClient.get<VisitListDTO>(this.getBase(clinicId), {
        params: {
          status: "OPEN",
          doctor_id: doctorId,
        },
      }),
    );
    const items = response.data.items ?? response.data.visits ?? [];

    return {
      items: items.map(visitToDomain),
      total: response.data.total ?? items.length,
    };
  }

  async save(visit: Partial<Visit>): Promise<Visit> {
    const response = await this.execute(() =>
      axiosClient.post<VisitDTO>(
        this.getBase(visit.clinicId ?? ""),
        openVisitToDTO({
          appointmentId: visit.appointmentId ?? "",
          clinicId: visit.clinicId ?? "",
          patientId: visit.patientId ?? "",
          patientName: visit.patientName ?? "",
          doctorId: visit.doctorId ?? "",
          doctorName: visit.doctorName ?? "",
        }),
      ),
    );
    return visitToDomain(response.data);
  }

  async updateStatus(visitId: string, status: VisitStatus): Promise<Visit> {
    const response = await this.execute(() =>
      axiosClient.patch<VisitDTO>(`/api/v1/treatment/visits/${visitId}/status`, {
        status,
      }),
    );
    return visitToDomain(response.data);
  }

  async updateTotalAmount(visitId: string, newTotal: number): Promise<void> {
    await this.execute(() =>
      axiosClient.patch(`/api/v1/treatment/visits/${visitId}/total`, {
        total_amount: newTotal,
      }),
    );
  }

  async assignAssistant(
    visitId: string,
    assistantId: string,
    assistantName: string,
  ): Promise<Visit> {
    const response = await this.execute(() =>
      axiosClient.patch<VisitDTO>(
        `/api/v1/treatment/visits/${visitId}/assistant`,
        assignAssistantToDTO(assistantId, assistantName),
      ),
    );
    return visitToDomain(response.data);
  }

  async confirm(visitId: string, confirmedBy: string): Promise<Visit> {
    const response = await this.execute(() =>
      axiosClient.patch<VisitDTO>(
        `/api/v1/treatment/visits/${visitId}/confirm`,
        confirmVisitToDTO(confirmedBy),
      ),
    );
    return visitToDomain(response.data);
  }

  async close(visitId: string): Promise<Visit> {
    const response = await this.execute(() =>
      axiosClient.patch<VisitDTO>(`/api/v1/treatment/visits/${visitId}/close`),
    );
    return visitToDomain(response.data);
  }
}
