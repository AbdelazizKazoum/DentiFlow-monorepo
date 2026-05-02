import {StaffRole} from "../entities/staff";

export interface UpdateStaffInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: StaffRole;
  isActive?: boolean;
}
