import {StaffRole} from "../entities/staff";

export interface CreateStaffInput {
  userId: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  phone?: string;
}
