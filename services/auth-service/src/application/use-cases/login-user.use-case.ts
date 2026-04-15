import {Inject, Injectable, UnauthorizedException} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import {IUserRepository} from "../../domain/repositories/user-repository.interface";
import {IJwtService} from "../ports/jwt-service.interface";
import {
  USER_REPOSITORY,
  JWT_SERVICE,
} from "../../shared/constants/injection-tokens";
import {AuthResponse} from "./register-user.use-case";

export interface LoginUserCommand {
  email: string;
  password: string;
  clinicId: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(JWT_SERVICE) private readonly jwtService: IJwtService,
  ) {}

  async execute(command: LoginUserCommand): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmailAndClinic(
      command.email,
      command.clinicId,
    );

    if (!user) {
      // Constant-time dummy compare to prevent user-enumeration via response timing
      await bcrypt.compare(
        command.password,
        "$2a$12$Yoh6i6w1F0a27lxKrZIizeBFaAr0c1HPaW3J7Tl9kTGIV7Gl2lv52",
      );
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      command.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = await this.jwtService.sign({
      user_id: user.id,
      clinic_id: user.clinicId,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        clinicId: user.clinicId,
      },
    };
  }
}
