import {StaffRepository} from "@/domain/staff/repositories/staffRepository";

export class DeleteStaff {
  constructor(private readonly repository: StaffRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
