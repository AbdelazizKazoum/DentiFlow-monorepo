import {ConflictException, Inject, Injectable} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import {v4 as uuidv4} from "uuid";
import {IUserRepository} from "../../domain/repositories/user-repository.interface";
import {IJwtService} from "../ports/jwt-service.interface";
import {User} from "../../domain/entities/user";
import {UserRole} from "../../domain/enums/user-role.enum";
import {
  USER_REPOSITORY,
  JWT_SERVICE,
} from "../../shared/constants/injection-tokens";

export interface RegisterUserCommand {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  clinicId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    clinicId: string;
  };
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(JWT_SERVICE) private readonly jwtService: IJwtService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmailAndClinic(
      command.email,
      command.clinicId,
    );

    if (existing) {
      throw new ConflictException("Email already registered for this clinic");
    }

    const passwordHash = await bcrypt.hash(command.password, 12);

    const user = new User(
      uuidv4(),
      command.clinicId,
      command.email,
      passwordHash,
      command.fullName,
      command.role,
      new Date(),
    );

    const saved = await this.userRepository.save(user);

    const accessToken = await this.jwtService.sign({
      user_id: saved.id,
      clinic_id: saved.clinicId,
      role: saved.role,
    });

    return {
      accessToken,
      user: {
        id: saved.id,
        email: saved.email,
        fullName: saved.fullName,
        role: saved.role,
        clinicId: saved.clinicId,
      },
    };
  }
}
