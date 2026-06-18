import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {ConfigService} from "@nestjs/config";

export function typeormOptionsFactory(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const isProduction = configService.get<string>("NODE_ENV") === "production";
  const synchronize = configService.get<boolean>(
    "DB_SYNCHRONIZE",
    !isProduction,
  );

  return {
    type: "mysql",
    host: configService.get<string>("DB_HOST", "localhost"),
    port: configService.get<number>("DB_PORT", 3306),
    username: configService.getOrThrow<string>("DB_USERNAME"),
    password: configService.getOrThrow<string>("DB_PASSWORD"),
    database: configService.getOrThrow<string>("DB_NAME"),
    autoLoadEntities: true, // picks up all entities registered via forFeature()
    synchronize,
    migrationsRun: false,
    logging: !isProduction,
    charset: "utf8mb4", // supports Arabic and all Unicode characters
    timezone: "Z", // store all timestamps as UTC
  };
}
