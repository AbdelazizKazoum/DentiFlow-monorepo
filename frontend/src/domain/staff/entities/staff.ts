export enum StaffRole {
  SECRETARY = "SECRETARY",
  DENTAL_ASSISTANT = "DENTAL_ASSISTANT",
  DOCTOR = "DOCTOR",
  ADMIN = "ADMIN",
}

export enum StaffStatus {
  ACTIVE = "active",
  ON_LEAVE = "on-leave",
  INACTIVE = "inactive",
}

export class Staff {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly userId: string,
    public readonly role: StaffRole,
    public readonly status: StaffStatus,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly specialization?: string,
    public readonly avatar?: string,
    public readonly isActive: boolean = true,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isDoctor(): boolean {
    return this.role === StaffRole.DOCTOR;
  }

  isActiveStaff(): boolean {
    return this.status === StaffStatus.ACTIVE;
  }
}
