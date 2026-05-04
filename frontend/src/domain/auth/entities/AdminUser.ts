// No framework imports — pure TypeScript domain types only

export type UserRole =
  | "patient"
  | "secretary"
  | "dental_assistant"
  | "doctor"
  | "admin";

export interface AdminLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  clinicId?: string;
}

export interface AdminRegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Exclude<UserRole, "patient">;
  clinicId?: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}
