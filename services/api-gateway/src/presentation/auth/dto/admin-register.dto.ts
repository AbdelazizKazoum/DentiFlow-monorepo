import {IsEmail, IsIn, IsNotEmpty, IsString} from "class-validator";

const ALLOWED_ROLES = [
  "secretariat",
  "dental_assistant",
  "doctor",
  "admin",
] as const;

export type AdminRole = (typeof ALLOWED_ROLES)[number];

export class AdminRegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsIn(ALLOWED_ROLES)
  role!: AdminRole;
}
