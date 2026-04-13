// Dependency injection container — wires repositories to use cases and exports
// ready-to-use instances. This is the only place that knows about concrete implementations.

import { AdminAuthRepositoryImpl } from "@/infrastructure/repositories/AdminAuthRepositoryImpl";
import { AdminLogin } from "@/application/auth/useCases/AdminLogin";

const adminAuthRepository = new AdminAuthRepositoryImpl();

export const adminLoginUseCase = new AdminLogin(adminAuthRepository);
