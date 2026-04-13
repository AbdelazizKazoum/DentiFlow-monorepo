// Use case — depends only on the domain repository interface. No API calls here.

import type {AdminAuthRepository} from "@/domain/auth/repositories/AdminAuthRepository";
import type {AdminLoginCredentials} from "@/domain/auth/entities/AdminUser";
import type {AdminUser} from "@/domain/auth/entities/AdminUser";

export class AdminLogin {
  constructor(private readonly authRepository: AdminAuthRepository) {}

  async execute(credentials: AdminLoginCredentials): Promise<AdminUser | null> {
    return this.authRepository.login(credentials);
  }
}
