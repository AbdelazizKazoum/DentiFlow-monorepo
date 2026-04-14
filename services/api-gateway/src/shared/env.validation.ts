import {plainToInstance} from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from "class-validator";

export enum NodeEnvironment {
  Development = "development",
  Production = "production",
  Test = "test",
}

/**
 * GatewayEnvironmentVariables — validated env contract for api-gateway.
 * IMPORTANT: NO DB vars — the gateway has no database.
 */
export class GatewayEnvironmentVariables {
  @IsEnum(NodeEnvironment)
  @IsOptional()
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsNumber()
  @IsOptional()
  JWT_EXPIRES_IN: number = 900;

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = "info";

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  // Downstream service URLs — placeholder until gRPC in Story 8.5
  @IsString()
  @IsOptional()
  AUTH_SERVICE_URL: string = "http://auth-service:3001";

  @IsString()
  @IsOptional()
  CLINIC_SERVICE_URL: string = "http://clinic-service:3002";
}

export function validateGatewayEnv(
  config: Record<string, unknown>,
): GatewayEnvironmentVariables {
  const validated = plainToInstance(GatewayEnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {skipMissingProperties: false});
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(", "))
      .join("\n");
    throw new Error(`Gateway environment validation failed:\n${messages}`);
  }
  return validated;
}
