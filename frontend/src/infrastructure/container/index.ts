// Dependency injection container — wires repositories to use cases and exports
// ready-to-use instances. This is the only place that knows about concrete implementations.

import { AdminAuthRepositoryImpl } from "@/infrastructure/repositories/AdminAuthRepositoryImpl";
import { AdminLogin } from "@/application/auth/useCases/AdminLogin";
import { InMemoryStaffRepository } from "@/infrastructure/staff/InMemoryStaffRepository";
import { GetAllStaff } from "@/application/staff/useCases/GetAllStaff";
import { CreateStaff } from "@/application/staff/useCases/CreateStaff";
import { UpdateStaff } from "@/application/staff/useCases/UpdateStaff";
import { DeleteStaff } from "@/application/staff/useCases/DeleteStaff";

// ─── Auth ─────────────────────────────────────────────────────────────────────
const adminAuthRepository = new AdminAuthRepositoryImpl();
export const adminLoginUseCase = new AdminLogin(adminAuthRepository);

// ─── Staff ────────────────────────────────────────────────────────────────────
const staffRepository = new InMemoryStaffRepository();
export const getAllStaffUseCase = new GetAllStaff(staffRepository);
export const createStaffUseCase = new CreateStaff(staffRepository);
export const updateStaffUseCase = new UpdateStaff(staffRepository);
export const deleteStaffUseCase = new DeleteStaff(staffRepository);
