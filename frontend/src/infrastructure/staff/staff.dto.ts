import {StaffRole, StaffStatus} from "../../domain/staff/entities/staff";

export interface StaffDTO {
  id: string;
  clinicId: string;
  userId: string;
  role: StaffRole;
  status: StaffStatus;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  specialization?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStaffDTO {
  clinicId: string;
  userId: string;
  role: StaffRole;
  status: StaffStatus;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  specialization?: string;
  avatar?: string;
}

export interface UpdateStaffDTO {
  role?: StaffRole;
  status?: StaffStatus;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  specialization?: string;
  avatar?: string;
  isActive?: boolean;
}
