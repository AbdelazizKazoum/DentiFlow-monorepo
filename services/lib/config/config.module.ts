import {DynamicModule, Module} from "@nestjs/common";
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions,
} from "@nestjs/config";
import {validateEnv} from "./env.validation";

/**
 * ConfigModule — wraps @nestjs/config with fail-fast validation.
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
          validate: validateEnv,
          envFilePath: [".env.local", ".env"],
          ...options,
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}
