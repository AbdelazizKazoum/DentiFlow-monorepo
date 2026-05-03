import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from "@nestjs/common";
import {ClientGrpc} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {status as GrpcStatus} from "@grpc/grpc-js";
import {AuthProto} from "@lib/proto";
import {
  IAuthServicePort,
  RegisterStaffUserInput,
  RegisteredStaffUser,
} from "../../application/ports/auth-service.port";
import {AUTH_SERVICE_GRPC_CLIENT} from "../../shared/constants/injection-tokens";
import {StaffRole} from "../../domain/enums/staff-role.enum";

const ROLE_MAP: Record<string, string> = {
  [StaffRole.SECRETARY]: "secretary",
  [StaffRole.DENTAL_ASSISTANT]: "doctor",
  [StaffRole.DOCTOR]: "doctor",
  [StaffRole.ADMIN]: "admin",
};

@Injectable()
export class AuthServiceGrpcAdapter implements IAuthServicePort, OnModuleInit {
  private authGrpcService!: AuthProto.AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_GRPC_CLIENT) private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGrpcService =
      this.grpcClient.getService<AuthProto.AuthServiceClient>(
        AuthProto.AUTH_SERVICE_NAME,
      );
  }

  async registerStaffUser(
    input: RegisterStaffUserInput,
  ): Promise<RegisteredStaffUser> {
    const mappedRole = ROLE_MAP[input.role] ?? input.role.toLowerCase();
    try {
      const reply = await lastValueFrom(
        this.authGrpcService.register({
          email: input.email,
          password: input.password,
          fullName: input.fullName,
          role: mappedRole,
          clinicId: input.clinicId,
        }),
      );

      const user = reply.user;
      if (!user) {
        throw new InternalServerErrorException(
          "Auth service did not return user profile",
        );
      }

      return {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
      };
    } catch (err: unknown) {
      const grpcErr = err as {
        code?: number;
        details?: string;
        message?: string;
      };
      if (grpcErr?.code === GrpcStatus.ALREADY_EXISTS) {
        throw new ConflictException(
          grpcErr.details ?? "Email already registered for this clinic",
        );
      }
      if (grpcErr?.code === GrpcStatus.INVALID_ARGUMENT) {
        throw new ConflictException(
          grpcErr.details ?? "Invalid registration data",
        );
      }
      if (
        err instanceof ConflictException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        "Failed to register staff user in auth service",
      );
    }
  }
}
