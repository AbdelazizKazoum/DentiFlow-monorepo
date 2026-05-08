import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {status as GrpcStatus} from "@grpc/grpc-js";
import {PatientProto} from "@lib/proto";
import {ClientGrpc} from "@nestjs/microservices";
import {PATIENT_GRPC_CLIENT} from "../../../infrastructure/grpc/patient-grpc-client.module";

export const PATIENT_SERVICE_NAME = PatientProto.PATIENT_SERVICE_NAME;
export type PatientServiceClient = PatientProto.PatientServiceClient;

export function initPatientGrpcService(grpcClient: ClientGrpc): PatientServiceClient {
  return grpcClient.getService<PatientServiceClient>(PATIENT_SERVICE_NAME);
}

export {PATIENT_GRPC_CLIENT};

export function toBoolean(value: string): boolean {
  return value === "true" || value === "1";
}

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
    detail ?? "Patient service unavailable",
  );
}
