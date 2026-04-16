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
};
