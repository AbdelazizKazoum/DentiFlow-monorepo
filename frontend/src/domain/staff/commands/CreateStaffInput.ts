import {StaffRole, StaffStatus} from "../entities/staff";

export interface CreateStaffInput {
  userId: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  status: StaffStatus;
  phone?: string;
  email?: string;
  specialization?: string;
  avatar?: string;
}
