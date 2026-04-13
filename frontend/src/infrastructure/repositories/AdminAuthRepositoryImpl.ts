// Implements the domain AdminAuthRepository interface.
// Mock data lives here — in infrastructure, not in the application layer.

import type {AdminAuthRepository} from "@/domain/auth/repositories/AdminAuthRepository";
import type {AdminLoginCredentials} from "@/domain/auth/entities/AdminUser";
import type {AdminUser} from "@/domain/auth/entities/AdminUser";

const MOCK_ADMIN_PASSWORD = "admin123";

const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "1",
    firstName: "Abdelaziz",
    lastName: "Admin",
    email: "admin@dentiflow.com",
    role: "admin",
  },
  {
    id: "2",
    firstName: "Dr. Sara",
    lastName: "Hassan",
    email: "doctor@dentiflow.com",
    role: "doctor",
  },
];

export class AdminAuthRepositoryImpl implements AdminAuthRepository {
  async login(credentials: AdminLoginCredentials): Promise<AdminUser | null> {
    if (credentials.password !== MOCK_ADMIN_PASSWORD) return null;
    return MOCK_ADMIN_USERS.find((u) => u.email === credentials.email) ?? null;
  }
}
