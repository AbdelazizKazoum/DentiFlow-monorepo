// Repository interface — declared in domain, implemented in infrastructure

import type {AdminLoginCredentials} from "../entities/AdminUser";
import type {AdminUser} from "../entities/AdminUser";

export interface AdminAuthRepository {
  login(credentials: AdminLoginCredentials): Promise<AdminUser | null>;
}
