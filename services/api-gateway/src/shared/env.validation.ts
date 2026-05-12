import * as Joi from "joi";
import {jwtSchema, NodeEnvironment} from "@lib";

export {NodeEnvironment};

/**
 * gatewaySchema — adds gateway-specific vars on top of jwtSchema.
 * Inherits: NODE_ENV, PORT, LOG_LEVEL, JWT_SECRET, JWT_EXPIRES_IN.
 */
export const gatewaySchema = jwtSchema.concat(
  Joi.object({
    // Downstream service URLs — placeholder until gRPC in Story 8.5
    AUTH_SERVICE_URL: Joi.string().default("http://auth-service:3001"),
    CLINIC_SERVICE_URL: Joi.string().default("http://clinic-service:3002"),
    PATIENT_SERVICE_URL: Joi.string().default("http://patient-service:3004"),
    // gRPC URL for auth-service
    AUTH_SERVICE_GRPC_URL: Joi.string().default("auth-service:5001"),
    // gRPC URL for clinic-service
    CLINIC_SERVICE_GRPC_URL: Joi.string().default("clinic-service:5002"),
    // gRPC URL for patient-service
    PATIENT_SERVICE_GRPC_URL: Joi.string().default("patient-service:5003"),
    // gRPC URL for appointment-service
    APPOINTMENT_SERVICE_GRPC_URL: Joi.string().default(
      "appointment-service:5004",
    ),
    NATS_URL: Joi.string().allow("").optional(),
  }),
);

export type GatewayEnv = {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  LOG_LEVEL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
  AUTH_SERVICE_URL: string;
  CLINIC_SERVICE_URL: string;
  PATIENT_SERVICE_URL: string;
  AUTH_SERVICE_GRPC_URL: string;
  CLINIC_SERVICE_GRPC_URL: string;
  PATIENT_SERVICE_GRPC_URL: string;
  APPOINTMENT_SERVICE_GRPC_URL: string;
  NATS_URL?: string;
};
