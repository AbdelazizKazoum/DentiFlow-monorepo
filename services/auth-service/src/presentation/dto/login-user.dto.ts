import {IsEmail, IsNotEmpty, IsString, IsUUID} from "class-validator";

export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsUUID()
  clinicId!: string;
}
