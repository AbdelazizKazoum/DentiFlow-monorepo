import type {Appointment} from "@/domain/appointment/entities/appointment";
import type {
  AppointmentDTO,
  SaveAppointmentDTO,
} from "@/infrastructure/appointment/dtos";

export function appointmentToDomain(dto: AppointmentDTO): Appointment {
  return {
    id: dto.id,
    clinicId: dto.clinic_id,
    patientId: dto.patient_id,
    patientName: dto.patient_name,
    patientPhone: dto.patient_phone,
    doctorId: dto.doctor_id,
    doctorName: dto.doctor_name,
    startAt: new Date(dto.start_at),
    endAt: new Date(dto.end_at),
    isEmergency: dto.is_emergency,
    type: dto.type,
    channel: dto.channel,
    status: dto.status,
    notes: dto.notes,
    cancelledAt: dto.cancelled_at ? new Date(dto.cancelled_at) : undefined,
    cancellationReason: dto.cancellation_reason,
  };
}

export function appointmentToDTO(
  appointment: Partial<Appointment>,
): SaveAppointmentDTO {
  return {
    id: appointment.id,
    clinic_id: appointment.clinicId,
    patient_id: appointment.patientId,
    patient_name: appointment.patientName,
    patient_phone: appointment.patientPhone,
    doctor_id: appointment.doctorId,
    doctor_name: appointment.doctorName,
    start_at: appointment.startAt?.toISOString(),
    end_at: appointment.endAt?.toISOString(),
    is_emergency: appointment.isEmergency,
    type: appointment.type,
    channel: appointment.channel,
    status: appointment.status,
    notes: appointment.notes,
    cancelled_at: appointment.cancelledAt?.toISOString(),
    cancellation_reason: appointment.cancellationReason,
  };
}
