export interface RegisterStaffUserInput {
  email: string;
  password: string;
  fullName: string;
  role: string;
  clinicId: string;
}

export interface RegisteredStaffUser {
  userId: string;
  email: string;
  fullName: string;
}

export interface IAuthServicePort {
  registerStaffUser(
    input: RegisterStaffUserInput,
  ): Promise<RegisteredStaffUser>;
}
