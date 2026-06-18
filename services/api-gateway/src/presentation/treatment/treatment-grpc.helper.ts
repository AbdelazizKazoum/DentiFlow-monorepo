import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {status as GrpcStatus} from "@grpc/grpc-js";
import {ClientGrpc} from "@nestjs/microservices";
import {TreatmentProto} from "@lib/proto";
import {TREATMENT_GRPC_CLIENT} from "../../infrastructure/grpc/treatment-grpc-client.module";

export const TREATMENT_SERVICE_NAME = TreatmentProto.TREATMENT_SERVICE_NAME;
export type TreatmentServiceClient = TreatmentProto.TreatmentServiceClient;

export function initTreatmentGrpcService(
  grpcClient: ClientGrpc,
): TreatmentServiceClient {
  return grpcClient.getService<TreatmentServiceClient>(TREATMENT_SERVICE_NAME);
}

export {TREATMENT_GRPC_CLIENT};

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
    detail ?? "Treatment service unavailable",
  );
}

type GrpcShape = Record<string, unknown>;

function field<T>(
  dto: GrpcShape,
  camelName: string,
  snakeName: string,
  fallback: T,
): T {
  return (dto[camelName] ?? dto[snakeName] ?? fallback) as T;
}

export function grpcClinicId(dto: unknown): string {
  return field<string>(dto as GrpcShape, "clinicId", "clinic_id", "");
}

export function visitToHttp(dto: TreatmentProto.VisitReply) {
  const shape = dto as unknown as GrpcShape;
  return {
    id: field<string>(shape, "id", "id", ""),
    clinic_id: grpcClinicId(shape),
    appointment_id: field<string>(shape, "appointmentId", "appointment_id", ""),
    patient_id: field<string>(shape, "patientId", "patient_id", ""),
    patient_name: field<string>(shape, "patientName", "patient_name", ""),
    doctor_id: field<string>(shape, "doctorId", "doctor_id", ""),
    doctor_name: field<string>(shape, "doctorName", "doctor_name", ""),
    assistant_id:
      field<string>(shape, "assistantId", "assistant_id", "") || undefined,
    assistant_name:
      field<string>(shape, "assistantName", "assistant_name", "") || undefined,
    status: field<string>(shape, "status", "status", ""),
    total_amount: field<number>(shape, "totalAmount", "total_amount", 0),
    confirmed_at:
      field<string>(shape, "confirmedAt", "confirmed_at", "") || undefined,
    confirmed_by:
      field<string>(shape, "confirmedBy", "confirmed_by", "") || undefined,
    voided_at: field<string>(shape, "voidedAt", "voided_at", "") || undefined,
    void_reason:
      field<string>(shape, "voidReason", "void_reason", "") || undefined,
    created_at: field<string>(shape, "createdAt", "created_at", ""),
    updated_at: field<string>(shape, "updatedAt", "updated_at", ""),
    treatment_acts: field<TreatmentProto.TreatmentActReply[]>(
      shape,
      "treatmentActs",
      "treatment_acts",
      [],
    ).map(treatmentActToHttp),
  };
}

export function actCatalogToHttp(dto: TreatmentProto.ActCatalogReply) {
  const shape = dto as unknown as GrpcShape;
  return {
    id: field<string>(shape, "id", "id", ""),
    clinic_id: grpcClinicId(shape),
    code: field<string>(shape, "code", "code", ""),
    name_ar: field<string>(shape, "nameAr", "name_ar", ""),
    name_fr: field<string>(shape, "nameFr", "name_fr", ""),
    name_en: field<string>(shape, "nameEn", "name_en", ""),
    default_price: field<number>(shape, "defaultPrice", "default_price", 0),
    is_active: field<boolean>(shape, "isActive", "is_active", false),
    icon: field<string>(shape, "icon", "icon", "") || undefined,
    created_at: field<string>(shape, "createdAt", "created_at", ""),
    updated_at: field<string>(shape, "updatedAt", "updated_at", ""),
  };
}

export function treatmentActToHttp(dto: TreatmentProto.TreatmentActReply) {
  const shape = dto as unknown as GrpcShape;
  return {
    id: field<string>(shape, "id", "id", ""),
    clinic_id: grpcClinicId(shape),
    visit_id: field<string>(shape, "visitId", "visit_id", ""),
    act_catalog_id: field<string>(shape, "actCatalogId", "act_catalog_id", ""),
    tooth_fdi: field<string>(shape, "toothFdi", "tooth_fdi", "") || undefined,
    quantity: field<number>(shape, "quantity", "quantity", 0),
    unit_price: field<number>(shape, "unitPrice", "unit_price", 0),
    surface: field<string>(shape, "surface", "surface", "") || undefined,
    tooth_part: field<string>(shape, "toothPart", "tooth_part", "") || undefined,
    dentition: field<string>(shape, "dentition", "dentition", "") || undefined,
    status: field<string>(shape, "status", "status", ""),
    notes: field<string>(shape, "notes", "notes", "") || undefined,
    entered_by: field<string>(shape, "enteredBy", "entered_by", ""),
    created_at: field<string>(shape, "createdAt", "created_at", ""),
    updated_at: field<string>(shape, "updatedAt", "updated_at", ""),
  };
}
