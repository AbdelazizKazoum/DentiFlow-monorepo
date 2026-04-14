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
 * EnvironmentVariables — validated contract for required env vars.
 * Services may extend this class to add service-specific vars.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  @IsOptional()
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsString()
  @IsNotEmpty()
  DB_HOST!: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsOptional()
  DB_PORT: number = 3306;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME!: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsNumber()
  @IsOptional()
  JWT_EXPIRES_IN: number = 900; // seconds — 15 min, matches frontend NextAuth TTL

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = "info";

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {skipMissingProperties: false});
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(", "))
      .join("\n");
    throw new Error(`Environment validation failed:\n${messages}`);
  }
  return validated;
}
