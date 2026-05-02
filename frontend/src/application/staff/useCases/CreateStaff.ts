import {Staff} from "@/domain/staff/entities/staff";
import {StaffRepository} from "@/domain/staff/repositories/staffRepository";
import type {CreateStaffInput} from "@/domain/staff/commands/CreateStaffInput";

export class CreateStaff {
  constructor(private readonly repository: StaffRepository) {}

  async execute(input: CreateStaffInput): Promise<Staff> {
    return this.repository.create(input);
  }
}
