import {Staff} from "@domain/staff/entities/staff";
import type {StaffDTO, CreateStaffDTO, UpdateStaffDTO} from "./staff.dto";
import type {CreateStaffInput} from "@domain/staff/commands/CreateStaffInput";
import type {UpdateStaffInput} from "@domain/staff/commands/UpdateStaffInput";

// 🔹 API → Domain
export const toDomain = (dto: StaffDTO): Staff =>
  new Staff(
    dto.id,
    dto.clinicId,
    dto.userId,
    dto.role,
    dto.firstName,
    dto.lastName,
    dto.createdAt,
    dto.updatedAt,
    dto.phone,
    dto.isActive,
  );

// 🔹 Domain → API (Full DTO)
export const toDTO = (staff: Staff): StaffDTO => ({
  id: staff.id,
  clinicId: staff.clinicId,
  userId: staff.userId,
  role: staff.role,
  firstName: staff.firstName,
  lastName: staff.lastName,
  phone: staff.phone,
  isActive: staff.isActive,
  createdAt: staff.createdAt,
  updatedAt: staff.updatedAt,
});

// 🔹 Domain → API (Create)
export const toCreateDTO = (input: CreateStaffInput): CreateStaffDTO => ({
  userId: input.userId,
  clinicId: input.clinicId,
  firstName: input.firstName,
  lastName: input.lastName,
  role: input.role,
  phone: input.phone,
});

// 🔹 Domain → API (Update)
export const toUpdateDTO = (input: UpdateStaffInput): UpdateStaffDTO => ({
  firstName: input.firstName,
  lastName: input.lastName,
  phone: input.phone,
  role: input.role,
  isActive: input.isActive,
});
