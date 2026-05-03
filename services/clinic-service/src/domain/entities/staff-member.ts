import {StaffRole} from "../enums/staff-role.enum";
import {StaffStatus} from "../enums/staff-status.enum";

export class StaffMember {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    /** Cross-service reference to auth_service.users */
    public readonly userId: string,
    public readonly role: StaffRole,
    public readonly status: StaffStatus,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly specialization: string | null,
    public readonly avatar: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
