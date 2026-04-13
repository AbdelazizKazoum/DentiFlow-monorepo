import {useAdminAuthStore} from "@/presentation/stores/adminAuthStore";
import type {AdminLoginCredentials} from "@/domain/auth/entities";

export class MockAdminLoginUseCase {
  static execute(credentials: AdminLoginCredentials): boolean {
    return useAdminAuthStore.getState().mockLogin(credentials);
  }
}
