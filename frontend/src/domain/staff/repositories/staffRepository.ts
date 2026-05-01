import {Staff} from "../entities/staff";

export interface StaffRepository {
  findById(id: string): Promise<Staff | null>;
  findByClinicId(clinicId: string): Promise<Staff[]>;
  findByUserId(userId: string): Promise<Staff | null>;
  save(staff: Staff): Promise<void>;
  update(staff: Staff): Promise<void>;
  delete(id: string): Promise<void>;
}
