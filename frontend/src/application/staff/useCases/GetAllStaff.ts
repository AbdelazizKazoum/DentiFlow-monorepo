import {Staff} from "@/domain/staff/entities/staff";
import {StaffRepository} from "@/domain/staff/repositories/staffRepository";

export class GetAllStaff {
  constructor(private readonly repository: StaffRepository) {}

  async execute(): Promise<Staff[]> {
    return this.repository.findAll();
  }
}
