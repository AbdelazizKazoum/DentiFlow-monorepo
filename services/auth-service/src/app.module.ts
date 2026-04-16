import {Module} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {ConfigModule, LoggerModule, DatabaseModule} from "@lib";
import {AuthModule} from "./auth/auth.module";
import {HealthModule} from "./presentation/health/health.module";

@Module({
  imports: [
    // MUST be first — provides ConfigService globally
    ConfigModule.forRoot(),

    // Global structured JSON logger + correlation interceptor
    LoggerModule,

    // TypeORM connection — reads DB_* vars via ConfigService
    DatabaseModule.forRoot(),

    // Passport with JWT as default strategy
    PassportModule.register({defaultStrategy: "jwt"}),

    // JwtModule — used by JwtAdapter for token signing
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<number>("JWT_EXPIRES_IN", 900),
        },
      }),
    }),

    // Feature modules
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
