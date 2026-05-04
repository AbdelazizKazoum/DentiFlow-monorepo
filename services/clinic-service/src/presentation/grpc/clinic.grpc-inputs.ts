import {Transform, Type} from "class-transformer";
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
import {StaffStatus} from "../../domain/enums/staff-status.enum";

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
  @Transform(({value}) => (value === "" ? undefined : value))
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
  @IsUUID("all")
  clinicId!: string;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => WorkingHoursEntryInput)
  entries!: WorkingHoursEntryInput[];
}

export class CreateStaffMemberInput {
  @IsUUID("all")
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
  @Transform(({value}) => (value === "" ? undefined : value))
  @IsUrl()
  @MaxLength(500)
  avatar?: string;
}

export class UpdateStaffMemberInput {
  @IsUUID("all")
  staffMemberId!: string;

  @IsUUID("all")
  clinicId!: string;

  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  @MaxLength(255)
  specialization?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsUrl()
  @MaxLength(500)
  avatar?: string | null;
}

export class DeleteStaffMemberInput {
  @IsUUID("all")
  staffMemberId!: string;

  @IsUUID("all")
  clinicId!: string;
}
