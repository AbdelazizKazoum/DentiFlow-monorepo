import {StaffRole, StaffStatus} from "../entities/staff";

export interface UpdateStaffInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  specialization?: string;
  avatar?: string;
  role?: StaffRole;
  status?: StaffStatus;
  isActive?: boolean;
  password?: string;
}
