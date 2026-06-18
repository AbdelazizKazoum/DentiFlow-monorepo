import type {Visit, VisitStatus} from "@/domain/treatment/entities/Visit";
import type {
  PaginatedVisits,
  VisitRepository,
} from "@/domain/treatment/repositories/VisitRepository";
import {axiosClient} from "@/infrastructure/http/axiosClient";
import {BaseRepository} from "@/infrastructure/http/BaseRepository";
import type {VisitByAppointmentDTO, VisitDTO, VisitListDTO} from "../dtos";
import {
  assignAssistantToDTO,
  openVisitToDTO,
  visitToDomain,
  voidVisitToDTO,
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
    // Backend should return the active/latest non-voided visit for this
    // appointment. Voided visits remain audit history, not active encounters.
    const response = await this.execute(() =>
      axiosClient.get<VisitByAppointmentDTO>(
        `/api/v1/treatment/visits/by-appointment/${appointmentId}`,
      ),
    );
    return response.data.visit ? visitToDomain(response.data.visit) : null;
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
    if (status === "CONFIRMED") {
      return this.confirm(visitId, "");
    }

    if (status === "CLOSED") {
      return this.close(visitId);
    }

    if (status === "VOIDED") {
      return this.void(visitId, "Visit status updated to voided.");
    }

    return this.getById(visitId);
  }

  async updateTotalAmount(_visitId: string, _newTotal: number): Promise<void> {
    void _visitId;
    void _newTotal;
    // Totals are calculated and persisted by the treatment API when acts change.
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
    void confirmedBy;
    const response = await this.execute(() =>
      axiosClient.patch<VisitDTO>(`/api/v1/treatment/visits/${visitId}/confirm`),
    );
    return visitToDomain(response.data);
  }

  async close(visitId: string): Promise<Visit> {
    const response = await this.execute(() =>
      axiosClient.patch<VisitDTO>(`/api/v1/treatment/visits/${visitId}/close`),
    );
    return visitToDomain(response.data);
  }

  async void(visitId: string, reason: string): Promise<Visit> {
    const response = await this.execute(() =>
      axiosClient.patch<VisitDTO>(
        `/api/v1/treatment/visits/${visitId}/void`,
        voidVisitToDTO(reason),
      ),
    );
    return visitToDomain(response.data);
  }
}
