import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{user: JwtPayload}>();
    if (!request.user) {
      throw new UnauthorizedException(
        "Invalid or missing authentication token",
      );
    }
    return request.user;
  },
);
