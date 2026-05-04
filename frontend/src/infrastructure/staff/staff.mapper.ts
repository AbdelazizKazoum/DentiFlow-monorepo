import {Staff, StaffRole, StaffStatus} from "../../domain/staff/entities/staff";
import type {StaffDTO, CreateStaffDTO, UpdateStaffDTO} from "./staff.dto";
import type {CreateStaffInput} from "../../domain/staff/commands/CreateStaffInput";
import type {UpdateStaffInput} from "../../domain/staff/commands/UpdateStaffInput";

const emptyToUndefined = (v: string): string | undefined =>
  v === "" ? undefined : v;

// 🔹 API → Domain
export const toDomain = (dto: StaffDTO): Staff =>
  new Staff(
    dto.id,
    dto.clinicId,
    dto.userId,
    dto.role as StaffRole,
    dto.status as StaffStatus,
    dto.firstName,
    dto.lastName,
    new Date(),
    new Date(),
    emptyToUndefined(dto.phone),
    emptyToUndefined(dto.email),
    emptyToUndefined(dto.specialization),
    emptyToUndefined(dto.avatar),
    dto.isActive,
  );

// 🔹 Domain → API (Create) — only fields the backend accepts
export const toCreateDTO = (input: CreateStaffInput): CreateStaffDTO => ({
  role: input.role,
  firstName: input.firstName,
  lastName: input.lastName,
  email: input.email ?? "",
  password: input.password,
  ...(input.phone ? {phone: input.phone} : {}),
  ...(input.specialization ? {specialization: input.specialization} : {}),
  ...(input.avatar ? {avatar: input.avatar} : {}),
});

// 🔹 Domain → API (Update) — only updatable fields
export const toUpdateDTO = (input: UpdateStaffInput): UpdateStaffDTO => ({
  ...(input.role !== undefined ? {role: input.role} : {}),
  ...(input.status !== undefined ? {status: input.status} : {}),
  ...(input.firstName !== undefined ? {firstName: input.firstName} : {}),
  ...(input.lastName !== undefined ? {lastName: input.lastName} : {}),
  ...(input.phone !== undefined ? {phone: input.phone || null} : {}),
  ...(input.specialization !== undefined
    ? {specialization: input.specialization || null}
    : {}),
  ...(input.avatar !== undefined ? {avatar: input.avatar || null} : {}),
});
