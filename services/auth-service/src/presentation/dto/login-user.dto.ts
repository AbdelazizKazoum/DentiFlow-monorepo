import {IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";

export class LoginUserDto {
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
