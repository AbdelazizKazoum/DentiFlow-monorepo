import { AdminLogin } from "@/application/auth/useCases/AdminLogin";
import { AdminAuthRepositoryImpl } from "@/infrastructure/repositories/AdminAuthRepositoryImpl";

const adminAuthRepository = new AdminAuthRepositoryImpl();

export const adminLoginUseCase = new AdminLogin(adminAuthRepository);
