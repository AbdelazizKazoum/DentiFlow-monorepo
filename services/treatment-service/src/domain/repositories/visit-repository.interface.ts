import {Visit} from "../entities/visit";

export interface OpenVisitInput {
  clinicId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
}

export interface IVisitRepository {
  findById(id: string): Promise<Visit | null>;
  findActiveByAppointmentId(appointmentId: string): Promise<Visit | null>;
  listOpenByClinic(clinicId: string, doctorId?: string): Promise<Visit[]>;
  create(input: OpenVisitInput): Promise<Visit>;
  assignAssistant(
    visitId: string,
    assistantId: string,
    assistantName: string,
  ): Promise<Visit>;
  updateTotalAmount(visitId: string, totalAmount: number): Promise<void>;
  confirm(visitId: string, confirmedBy: string): Promise<Visit>;
  close(visitId: string): Promise<Visit>;
  void(visitId: string, reason: string): Promise<Visit>;
}
