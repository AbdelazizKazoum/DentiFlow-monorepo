import {Staff} from "../entities/staff";
import type {CreateStaffInput} from "../commands/CreateStaffInput";
import type {UpdateStaffInput} from "../commands/UpdateStaffInput";

export interface StaffRepository {
  findById(id: string): Promise<Staff | null>;
  findByClinicId(clinicId: string): Promise<Staff[]>;
  findByUserId(userId: string): Promise<Staff | null>;
  create(input: CreateStaffInput): Promise<Staff>;
  update(id: string, input: UpdateStaffInput): Promise<Staff>;
  delete(id: string): Promise<void>;
}
