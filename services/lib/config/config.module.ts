import {DynamicModule, Module} from "@nestjs/common";
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions,
} from "@nestjs/config";
import {databaseSchema} from "./env.validation";

/**
 * ConfigModule — wraps @nestjs/config with fail-fast Joi validation.
 *
 * Defaults to databaseSchema. Pass a custom validationSchema for services
 * without a DB (e.g. api-gateway passes jwtSchema.concat(...)).
 *
 * MUST be the first import in the service AppModule.
 * isGlobal: true makes ConfigService injectable everywhere.
 */
@Module({})
export class ConfigModule {
  static forRoot(options: Partial<ConfigModuleOptions> = {}): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
          validationSchema: databaseSchema,
          validationOptions: {abortEarly: false},
          envFilePath: [".env.local", ".env"],
          ...options,
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}
