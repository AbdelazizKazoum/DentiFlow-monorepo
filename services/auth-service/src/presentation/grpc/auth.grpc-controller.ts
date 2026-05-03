import {Controller, Inject, UsePipes, ValidationPipe} from "@nestjs/common";
import {GrpcMethod, RpcException} from "@nestjs/microservices";
import {status} from "@grpc/grpc-js";
import {LoginUserUseCase} from "../../application/use-cases/login-user.use-case";
import {RegisterUserUseCase} from "../../application/use-cases/register-user.use-case";
import {RefreshTokenUseCase} from "../../application/use-cases/refresh-token.use-case";
import {REFRESH_TOKEN_USE_CASE} from "../../shared/constants/injection-tokens";
import {UserRole} from "../../domain/enums/user-role.enum";
import {AuthProto} from "@lib/proto";
import {AuthGrpcMapper} from "./auth.grpc-mapper";
import {LoginInput, RegisterInput} from "./auth.grpc-inputs";

type RefreshTokenRequest = AuthProto.RefreshTokenRequest;

@UsePipes(new ValidationPipe({transform: true, whitelist: true}))
@Controller()
export class AuthGrpcController {
  constructor(
    private readonly loginUseCase: LoginUserUseCase,
    private readonly registerUseCase: RegisterUserUseCase,
    @Inject(REFRESH_TOKEN_USE_CASE)
    private readonly refreshUseCase: RefreshTokenUseCase,
  ) {}

  @GrpcMethod("AuthService", "Login")
  async login(data: LoginInput) {
    try {
      const result = await this.loginUseCase.execute({
        email: data.email,
        password: data.password,
        clinicId: data.clinicId ?? "",
      });
      return AuthGrpcMapper.toAuthReply(result);
    } catch (err: unknown) {
      this.rethrowAsRpc(err);
    }
  }

  @GrpcMethod("AuthService", "Register")
  async register(data: RegisterInput) {
    try {
      const result = await this.registerUseCase.execute({
        ...data,
        role: data.role as UserRole,
        clinicId: data.clinicId ?? "",
      });
      return AuthGrpcMapper.toAuthReply(result);
    } catch (err: unknown) {
      this.rethrowAsRpc(err);
    }
  }

  @GrpcMethod("AuthService", "RefreshToken")
  async refreshToken(data: RefreshTokenRequest) {
    try {
      const result = await this.refreshUseCase.execute(data.refreshToken);
      return AuthGrpcMapper.toRefreshTokenReply(result);
    } catch (err: unknown) {
      this.rethrowAsRpc(err);
    }
  }

  private rethrowAsRpc(err: unknown): never {
    if (err instanceof RpcException) throw err;

    const httpErr = err as {status?: number; message?: string};
    const httpStatus = httpErr?.status;
    const message = httpErr?.message ?? "Unknown error";

    if (httpStatus === 401 || httpStatus === 403) {
      throw new RpcException({code: status.UNAUTHENTICATED, message});
    }
    if (httpStatus === 404) {
      throw new RpcException({code: status.NOT_FOUND, message});
    }
    if (httpStatus === 409) {
      throw new RpcException({code: status.ALREADY_EXISTS, message});
    }
    if (httpStatus === 400) {
      throw new RpcException({code: status.INVALID_ARGUMENT, message});
    }
    throw new RpcException({
      code: status.INTERNAL,
      message: "Internal server error",
    });
  }
}
