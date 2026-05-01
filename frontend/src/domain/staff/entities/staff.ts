export enum StaffRole {
  SECRETARY = "SECRETARY",
  DENTAL_ASSISTANT = "DENTAL_ASSISTANT",
  DOCTOR = "DOCTOR",
  ADMIN = "ADMIN",
}

export class Staff {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly userId: string,
    public readonly role: StaffRole,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone?: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isDoctor(): boolean {
    return this.role === StaffRole.DOCTOR;
  }

  isActiveStaff(): boolean {
    return this.isActive;
  }
}
