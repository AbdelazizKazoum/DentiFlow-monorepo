// No framework imports — pure TypeScript domain types only

export type UserRole =
  | "patient"
  | "secretariat"
  | "dental_assistant"
  | "doctor"
  | "admin";

export interface AdminLoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}
