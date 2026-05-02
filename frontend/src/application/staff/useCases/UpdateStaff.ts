import {Staff} from "@/domain/staff/entities/staff";
import {StaffRepository} from "@/domain/staff/repositories/staffRepository";
import type {UpdateStaffInput} from "@/domain/staff/commands/UpdateStaffInput";

export class UpdateStaff {
  constructor(private readonly repository: StaffRepository) {}

  async execute(id: string, input: UpdateStaffInput): Promise<Staff> {
    return this.repository.update(id, input);
  }
}
