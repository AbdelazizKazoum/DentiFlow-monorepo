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
      route?: {path?: string};
    }>();

    const routePath = request.route?.path ?? "";
    const clinicIdParam =
      request.params?.clinicId ??
      request.params?.clinic_id ??
      (routePath.includes("clinics/:id") ? request.params?.id : undefined);

    // No clinic id in the route (e.g. POST /clinics or /treatment/procedures/:id)
    // — nothing to scope-check here. Route handlers can still scope body/query data.
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
