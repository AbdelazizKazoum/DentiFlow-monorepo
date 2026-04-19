import {Inject, Injectable} from "@nestjs/common";
import {RpcException} from "@nestjs/microservices";
import {status} from "@grpc/grpc-js";
import {IUserRepository} from "../../domain/repositories/user-repository.interface";
import {IJwtService} from "../ports/jwt-service.interface";
import {
  USER_REPOSITORY,
  JWT_SERVICE,
} from "../../shared/constants/injection-tokens";

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(JWT_SERVICE) private readonly jwtService: IJwtService,
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenResult> {
    let payload: {user_id: string};
    try {
      payload = await this.jwtService.verifyRefresh(refreshToken);
    } catch {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await this.userRepository.findByIdGlobal(payload.user_id);
    if (!user) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: "User not found",
      });
    }

    const newAccessToken = await this.jwtService.sign({
      user_id: user.id,
      clinic_id: user.clinicId,
      role: user.role,
    });

    const newRefreshToken = await this.jwtService.signRefresh({
      user_id: user.id,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
