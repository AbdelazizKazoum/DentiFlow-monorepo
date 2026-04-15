import {UserRole} from "../enums/user-role.enum";

export class User {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
  ) {}
}
