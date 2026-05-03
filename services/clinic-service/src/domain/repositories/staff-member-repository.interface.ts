import {StaffMember} from "../entities/staff-member";

export interface IStaffMemberRepository {
  findByUserAndClinic(
    userId: string,
    clinicId: string,
  ): Promise<StaffMember | null>;
  findByClinic(clinicId: string): Promise<StaffMember[]>;
  save(staffMember: StaffMember): Promise<StaffMember>;
}
