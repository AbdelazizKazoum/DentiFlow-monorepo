import type {Visit, VisitStatus} from "../entities/Visit";

export interface PaginatedVisits {
  items: Visit[];
  total: number;
}

export interface VisitRepository {
  getById(id: string): Promise<Visit>;
  getByAppointmentId(appointmentId: string): Promise<Visit | null>;
  getOpenVisits(clinicId: string, doctorId?: string): Promise<PaginatedVisits>;
  save(visit: Partial<Visit>): Promise<Visit>;
  updateStatus(visitId: string, status: VisitStatus): Promise<Visit>;
  updateTotalAmount(visitId: string, newTotal: number): Promise<void>;
  assignAssistant(
    visitId: string,
    assistantId: string,
    assistantName: string,
  ): Promise<Visit>;
  confirm(visitId: string, confirmedBy: string): Promise<Visit>;
  close(visitId: string): Promise<Visit>;
}
