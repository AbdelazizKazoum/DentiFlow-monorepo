import {Module} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {HttpModule} from "@nestjs/axios";
import {ConfigModule, LoggerModule} from "@lib";
import {gatewaySchema} from "./shared/env.validation";
import {JwtStrategy} from "./shared/strategies/jwt.strategy";
import {HealthModule} from "./presentation/health/health.module";
import {SseModule} from "./presentation/sse/sse.module";
import {ProxyModule} from "./presentation/proxy/proxy.module";
import {AuthModule} from "./presentation/auth/auth.module";

@Module({
  imports: [
    // MUST be first — provides ConfigService globally
    ConfigModule.forRoot({validationSchema: gatewaySchema}),

    // Global structured JSON logger + correlation interceptor
    LoggerModule,

    // Passport with JWT as default strategy
    PassportModule.register({defaultStrategy: "jwt"}),

    // JwtModule — used by JwtStrategy for signature verification
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<number>("JWT_EXPIRES_IN", 900),
        },
      }),
    }),

    // HTTP client for future proxy calls (gRPC wired in Story 8.5)
    HttpModule,

    // Feature modules
    HealthModule,
    SseModule,
    ProxyModule,
    AuthModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
