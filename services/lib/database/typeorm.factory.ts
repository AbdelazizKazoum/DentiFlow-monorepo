import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {ConfigService} from "@nestjs/config";

export function typeormOptionsFactory(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: "mysql",
    host: configService.get<string>("DB_HOST", "localhost"),
    port: configService.get<number>("DB_PORT", 3306),
    username: configService.getOrThrow<string>("DB_USERNAME"),
    password: configService.getOrThrow<string>("DB_PASSWORD"),
    database: configService.getOrThrow<string>("DB_NAME"),
    entities: [], // services register their own entities via TypeOrmModule.forFeature()
    synchronize: false, // NEVER true — schema changes go through migrations
    migrationsRun: false,
    logging: configService.get<string>("NODE_ENV") !== "production",
    charset: "utf8mb4", // supports Arabic and all Unicode characters
    timezone: "Z", // store all timestamps as UTC
  };
}
