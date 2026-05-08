import {Transform, Type} from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import {PatientGender} from "../../domain/enums/patient-gender.enum";
import {PatientStatus} from "../../domain/enums/patient-status.enum";
import {DocumentType} from "../../domain/enums/document-type.enum";

export class CreatePatientInput {
  @IsUUID("all")
  clinicId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsUUID("all")
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(PatientGender)
  gender?: PatientGender;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  chronicConditions?: string;

  @IsOptional()
  @IsString()
  currentMedications?: string;

  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;
}

export class UpdatePatientInput {
  @IsUUID("all")
  patientId!: string;

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
  email?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsDateString()
  dateOfBirth?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsEnum(PatientGender)
  gender?: PatientGender | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  address?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  notes?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  allergies?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  chronicConditions?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  currentMedications?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  medicalNotes?: string | null;

  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;
}

export class ListPatientsInput {
  @IsUUID("all")
  clinicId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;

  @IsOptional()
  @IsEnum(PatientGender)
  gender?: PatientGender;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @IsOptional()
  @IsString()
  sortBy?: "firstName" | "lastName" | "createdAt" | "updatedAt";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

export class SearchPatientsByNameInput {
  @IsUUID("all")
  clinicId!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class CreateInsuranceProviderInput {
  @IsUUID("all")
  clinicId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateInsuranceProviderInput {
  @IsUUID("all")
  providerId!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  @MaxLength(50)
  code?: string | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class CreateInsuranceTemplateInput {
  @IsUUID("all")
  insuranceProviderId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fileUrl!: string;
}

export class UpdateInsuranceTemplateInput {
  @IsUUID("all")
  templateId!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fileUrl?: string;
}

export class CreatePatientInsuranceInput {
  @IsUUID("all")
  clinicId!: string;

  @IsUUID("all")
  patientId!: string;

  @IsUUID("all")
  insuranceProviderId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  policyNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  memberId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePatientInsuranceInput {
  @IsUUID("all")
  insuranceId!: string;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  @MaxLength(100)
  policyNumber?: string | null;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  @MaxLength(100)
  memberId?: string | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class CreatePatientDocumentInput {
  @IsUUID("all")
  clinicId!: string;

  @IsUUID("all")
  patientId!: string;

  @IsEnum(DocumentType)
  type!: DocumentType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fileUrl!: string;
}

export class UpdatePatientDocumentInput {
  @IsUUID("all")
  documentId!: string;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @Transform(({value}) => (value === "" ? null : value))
  @IsString()
  @MaxLength(255)
  title?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fileUrl?: string;
}

export class DeleteManyDocumentsInput {
  @IsArray()
  @IsUUID("all", {each: true})
  ids!: string[];
}
