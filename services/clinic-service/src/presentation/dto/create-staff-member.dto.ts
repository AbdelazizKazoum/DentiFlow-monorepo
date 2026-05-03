import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from "class-validator";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {StaffRole} from "../../domain/enums/staff-role.enum";

export class CreateStaffMemberDto {
  @ApiProperty({description: "auth_service user ID for this staff member"})
  @IsUUID()
  userId!: string;

  @ApiProperty({enum: StaffRole})
  @IsEnum(StaffRole)
  role!: StaffRole;

  @ApiProperty({example: "Karim"})
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({example: "Benali"})
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({example: "+213 555 00 00 00"})
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({example: "k.benali@clinic.dz"})
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({example: "Orthodontics"})
  @IsOptional()
  @IsString()
  @MaxLength(255)
  specialization?: string;

  @ApiPropertyOptional({description: "URL to profile photo"})
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatar?: string;
}
