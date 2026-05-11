import type {CheckInPatientCommand} from "@/domain/queue/commands/CheckInPatientCommand";
import type {QueueEntry} from "@/domain/queue/entities/queueEntry";
import type {
  CheckInPatientDTO,
  QueueEntryDTO,
} from "@/infrastructure/queue/dtos";

export function queueEntryToDomain(dto: QueueEntryDTO): QueueEntry {
  return {
    id: dto.id,
    clinicId: dto.clinic_id,
    appointmentId: dto.appointment_id,
    patientId: dto.patient_id,
    patientName: dto.patient_name,
    patientPhone: dto.patient_phone,
    doctorId: dto.doctor_id,
    doctorName: dto.doctor_name,
    appointmentType: dto.appointment_type,
    status: dto.status,
    priority: dto.priority,
    notes: dto.queue_notes,
    arrivedAt: new Date(dto.arrived_at),
    calledAt: dto.called_at ? new Date(dto.called_at) : undefined,
    seatedAt: dto.seated_at ? new Date(dto.seated_at) : undefined,
    completedAt: dto.completed_at ? new Date(dto.completed_at) : undefined,
  };
}

export function checkInCommandToDTO(
  command: CheckInPatientCommand,
): CheckInPatientDTO {
  return {
    appointment_id: command.appointmentId,
    patient_id: command.patientId,
    patient_name: command.patientName,
    patient_phone: command.patientPhone,
    doctor_id: command.doctorId,
    doctor_name: command.doctorName,
    appointment_type: command.appointmentType,
    priority: command.priority,
    queue_notes: command.notes,
    arrived_at: command.arrivedAt?.toISOString(),
  };
}
