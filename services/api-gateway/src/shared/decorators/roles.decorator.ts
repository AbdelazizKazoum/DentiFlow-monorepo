import {SetMetadata} from "@nestjs/common";
import {UserRole} from "../../domain/auth/enums/user-role.enum";

export const ROLES_KEY = "roles";

/**
 * Attach allowed roles to a route handler or controller class.
 * Consumed by RolesGuard after JwtAuthGuard has populated request.user.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
