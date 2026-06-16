import type {OpenVisitCommand} from "@/domain/treatment/commands/OpenVisitCommand";
import type {Visit} from "@/domain/treatment/entities/Visit";
import type {
  AssignAssistantDTO,
  ConfirmVisitDTO,
  CreateVisitDTO,
  VisitDTO,
} from "../dtos/visit.dto";
import {treatmentActToDomain} from "./treatmentAct.mapper";

const emptyToUndefined = <T>(value: T | null | undefined): T | undefined =>
  value ?? undefined;

export const visitToDomain = (dto: VisitDTO): Visit => ({
  id: dto.id,
  clinicId: dto.clinic_id,
  appointmentId: dto.appointment_id,
  patientId: dto.patient_id,
  patientName: dto.patient_name,
  doctorId: dto.doctor_id,
  doctorName: dto.doctor_name,
  assistantId: emptyToUndefined(dto.assistant_id),
  assistantName: emptyToUndefined(dto.assistant_name),
  status: dto.status,
  totalAmount: dto.total_amount,
  confirmedAt: dto.confirmed_at ? new Date(dto.confirmed_at) : undefined,
  confirmedBy: emptyToUndefined(dto.confirmed_by),
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
  treatmentActs: dto.treatment_acts?.map(treatmentActToDomain),
});

export const openVisitToDTO = (
  command: OpenVisitCommand,
): CreateVisitDTO => ({
  appointment_id: command.appointmentId,
  clinic_id: command.clinicId,
  patient_id: command.patientId,
  patient_name: command.patientName,
  doctor_id: command.doctorId,
  doctor_name: command.doctorName,
});

export const assignAssistantToDTO = (
  assistantId: string,
  assistantName: string,
): AssignAssistantDTO => ({
  assistant_id: assistantId,
  assistant_name: assistantName,
});

export const confirmVisitToDTO = (confirmedBy: string): ConfirmVisitDTO => ({
  confirmed_by: confirmedBy,
});
