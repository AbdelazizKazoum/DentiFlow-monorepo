import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {UserTypeOrmEntity} from "../infrastructure/persistence/entities/user.typeorm-entity";
import {UserRepository} from "../infrastructure/persistence/repositories/user.repository";
import {
  JwtAdapter,
  REFRESH_JWT_SERVICE,
} from "../infrastructure/adapters/jwt.adapter";
import {RegisterUserUseCase} from "../application/use-cases/register-user.use-case";
import {LoginUserUseCase} from "../application/use-cases/login-user.use-case";
import {RefreshTokenUseCase} from "../application/use-cases/refresh-token.use-case";
import {AuthController} from "../presentation/controllers/auth.controller";
import {AuthGrpcController} from "../presentation/grpc/auth.grpc-controller";
import {
  USER_REPOSITORY,
  JWT_SERVICE,
  REFRESH_TOKEN_USE_CASE,
} from "../shared/constants/injection-tokens";

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity])],
  controllers: [AuthController, AuthGrpcController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    {provide: USER_REPOSITORY, useClass: UserRepository},
    {
      provide: REFRESH_JWT_SERVICE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new JwtService({
          secret: configService.getOrThrow<string>("REFRESH_TOKEN_SECRET"),
          signOptions: {
            expiresIn: configService.get<number>(
              "REFRESH_TOKEN_EXPIRES_IN",
              604800,
            ),
          },
        }),
    },
    {provide: JWT_SERVICE, useClass: JwtAdapter},
    {provide: REFRESH_TOKEN_USE_CASE, useClass: RefreshTokenUseCase},
  ],
})
export class AuthModule {}
