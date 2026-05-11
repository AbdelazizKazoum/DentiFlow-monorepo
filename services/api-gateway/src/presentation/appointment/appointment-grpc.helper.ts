import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {status as GrpcStatus} from "@grpc/grpc-js";
import {ClientGrpc} from "@nestjs/microservices";
import {AppointmentProto} from "@lib/proto";
import {APPOINTMENT_GRPC_CLIENT} from "../../infrastructure/grpc/appointment-grpc-client.module";

export const APPOINTMENT_SERVICE_NAME =
  AppointmentProto.APPOINTMENT_SERVICE_NAME;
export type AppointmentServiceClient = AppointmentProto.AppointmentServiceClient;

export function initAppointmentGrpcService(
  grpcClient: ClientGrpc,
): AppointmentServiceClient {
  return grpcClient.getService<AppointmentServiceClient>(
    APPOINTMENT_SERVICE_NAME,
  );
}

export {APPOINTMENT_GRPC_CLIENT};

export function toNumber(value: string): number {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    throw new BadRequestException(`Invalid numeric query value: ${value}`);
  }
  return numeric;
}

export function handleGrpcError(err: unknown): never {
  const grpcErr = err as {code?: number; details?: string; message?: string};
  const detail = grpcErr?.details ?? grpcErr?.message;

  if (grpcErr?.code === GrpcStatus.NOT_FOUND) {
    throw new NotFoundException(detail ?? "Not found");
  }
  if (grpcErr?.code === GrpcStatus.ALREADY_EXISTS) {
    throw new ConflictException(detail ?? "Already exists");
  }
  if (grpcErr?.code === GrpcStatus.INVALID_ARGUMENT) {
    throw new BadRequestException(detail ?? "Invalid argument");
  }

  throw new InternalServerErrorException(
    detail ?? "Appointment service unavailable",
  );
}

export function appointmentToHttp(dto: AppointmentProto.AppointmentReply) {
  return {
    id: dto.id,
    clinic_id: dto.clinicId,
    patient_id: dto.patientId,
    patient_name: dto.patientName,
    patient_phone: dto.patientPhone || undefined,
    doctor_id: dto.doctorId,
    doctor_name: dto.doctorName,
    start_at: dto.startAt,
    end_at: dto.endAt,
    is_emergency: dto.isEmergency,
    type: dto.type || undefined,
    channel: dto.channel,
    status: dto.status,
    notes: dto.notes || undefined,
    cancelled_at: dto.cancelledAt || undefined,
    cancellation_reason: dto.cancellationReason || undefined,
  };
}

export function queueEntryToHttp(dto: AppointmentProto.QueueEntryReply) {
  return {
    id: dto.id,
    clinic_id: dto.clinicId,
    appointment_id: dto.appointmentId,
    patient_id: dto.patientId,
    patient_name: dto.patientName,
    patient_phone: dto.patientPhone || undefined,
    doctor_id: dto.doctorId,
    doctor_name: dto.doctorName,
    appointment_type: dto.appointmentType || undefined,
    status: dto.status,
    priority: dto.priority,
    queue_notes: dto.queueNotes || undefined,
    arrived_at: dto.arrivedAt,
    called_at: dto.calledAt || undefined,
    seated_at: dto.seatedAt || undefined,
    completed_at: dto.completedAt || undefined,
  };
}
