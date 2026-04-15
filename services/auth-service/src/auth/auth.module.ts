import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {JwtModule} from "@nestjs/jwt";
import {UserTypeOrmEntity} from "../infrastructure/persistence/entities/user.typeorm-entity";
import {UserRepository} from "../infrastructure/persistence/repositories/user.repository";
import {JwtAdapter} from "../infrastructure/adapters/jwt.adapter";
import {RegisterUserUseCase} from "../application/use-cases/register-user.use-case";
import {LoginUserUseCase} from "../application/use-cases/login-user.use-case";
import {AuthController} from "../presentation/controllers/auth.controller";
import {
  USER_REPOSITORY,
  JWT_SERVICE,
} from "../shared/constants/injection-tokens";

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity]), JwtModule],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    {provide: USER_REPOSITORY, useClass: UserRepository},
    {provide: JWT_SERVICE, useClass: JwtAdapter},
  ],
})
export class AuthModule {}
