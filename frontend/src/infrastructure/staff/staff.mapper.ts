import {Staff, StaffRole} from "../../domain/staff/entities/staff";
import type {StaffDTO, CreateStaffDTO, UpdateStaffDTO} from "./staff.dto";

// 🔹 API → Domain
export const toDomain = (dto: StaffDTO): Staff =>
  new Staff(
    dto.id,
    dto.clinicId,
    dto.userId,
    dto.role,
    dto.firstName,
    dto.lastName,
    dto.phone,
    dto.isActive,
    dto.createdAt,
    dto.updatedAt,
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
export const toCreateDTO = (input: {
  userId: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}): CreateStaffDTO => ({
  userId: input.userId,
  clinicId: input.clinicId,
  firstName: input.firstName,
  lastName: input.lastName,
  role: input.role as StaffRole,
  phone: input.phone,
});

// 🔹 Domain → API (Update)
export const toUpdateDTO = (input: Partial<Staff>): UpdateStaffDTO => ({
  firstName: input.firstName,
  lastName: input.lastName,
  phone: input.phone,
  role: input.role as StaffRole,
  isActive: input.isActive,
});
