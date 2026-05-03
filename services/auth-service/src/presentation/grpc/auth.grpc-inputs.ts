import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import {Transform} from "class-transformer";
import {UserRole} from "../../domain/enums/user-role.enum";

export class LoginInput {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  @Transform(({value}) => value ?? "")
  clinicId?: string;
}

export class RegisterInput {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsString()
  @Transform(({value}) => value ?? "")
  clinicId?: string;
}
