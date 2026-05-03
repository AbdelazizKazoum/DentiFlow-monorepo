import {Type} from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import {Locale} from "../../domain/enums/locale.enum";
import {StaffRole} from "../../domain/enums/staff-role.enum";

export class CreateClinicInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  timezone?: string;

  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;
}

export class WorkingHoursEntryInput {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsOptional()
  @IsString()
  openTime?: string;

  @IsOptional()
  @IsString()
  closeTime?: string;

  @IsBoolean()
  isClosed!: boolean;
}

export class UpsertWorkingHoursInput {
  @IsUUID()
  clinicId!: string;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => WorkingHoursEntryInput)
  entries!: WorkingHoursEntryInput[];
}

export class CreateStaffMemberInput {
  @IsUUID()
  clinicId!: string;

  @IsEnum(StaffRole)
  role!: StaffRole;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  specialization?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatar?: string;
}
