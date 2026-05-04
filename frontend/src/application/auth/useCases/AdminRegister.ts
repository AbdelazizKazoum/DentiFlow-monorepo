// Use case — depends only on the domain repository interface. No API calls here.

import type {AdminAuthRepository} from "@/domain/auth/repositories/AdminAuthRepository";
import type {
  AdminRegisterCredentials,
  AdminUser,
} from "@/domain/auth/entities/AdminUser";

export class AdminRegister {
  constructor(private readonly authRepository: AdminAuthRepository) {}

  async execute(
    credentials: AdminRegisterCredentials,
  ): Promise<AdminUser | null> {
    return this.authRepository.register({
      ...credentials,
      clinicId:
        credentials.clinicId ?? process.env.NEXT_PUBLIC_DEFAULT_CLINIC_ID,
    });
  }
}
