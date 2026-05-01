import {StaffRole} from "@domain/staff/entities/staff";

export interface StaffDTO {
  id: string;
  clinicId: string;
  userId: string;
  role: StaffRole;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStaffDTO {
  clinicId: string;
  userId: string;
  role: StaffRole;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateStaffDTO {
  role?: StaffRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
}
