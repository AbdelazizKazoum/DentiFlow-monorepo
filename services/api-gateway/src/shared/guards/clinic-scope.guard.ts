import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import {JwtPayload} from "../../domain/auth/entities/jwt-payload.entity";

/**
 * ClinicScopeGuard — enforces that users can only access resources
 * belonging to their own clinic (the `clinic_id` baked into their JWT).
 *
 * Must run AFTER JwtAuthGuard so that request.user is already populated.
 *
 * Skips automatically when the route has no :id param (e.g. POST /clinics).
 */
@Injectable()
export class ClinicScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user: JwtPayload;
      params: Record<string, string>;
    }>();

    const clinicIdParam = request.params?.id;

    // No :id in the route (e.g. POST /clinics) — nothing to scope-check
    if (!clinicIdParam) {
      return true;
    }

    if (request.user.clinic_id !== clinicIdParam) {
      throw new ForbiddenException(
        "You do not have access to this clinic's resources",
      );
    }

    return true;
  }
}
