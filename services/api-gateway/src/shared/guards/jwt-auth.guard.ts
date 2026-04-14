import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<T = JwtPayload>(err: Error | null, user: T | false): T {
    // Never leak internal error details to HTTP response
    if (err || !user) {
      throw new UnauthorizedException(
        "Invalid or missing authentication token",
      );
    }
    return user;
  }
}
