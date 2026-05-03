import {AuthResponse} from "../../application/use-cases/register-user.use-case";
import {AuthProto} from "@lib/proto";

export class AuthGrpcMapper {
  static toAuthReply(result: AuthResponse): AuthProto.AuthReply {
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        clinicId: result.user.clinicId,
      },
    };
  }

  static toRefreshTokenReply(result: {
    accessToken: string;
    refreshToken: string;
  }): AuthProto.RefreshTokenReply {
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
}
