import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from "class-validator";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Locale} from "../../domain/enums/locale.enum";

export class CreateClinicDto {
  @ApiProperty({example: "dr-benali-algiers"})
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug!: string;

  @ApiProperty({example: "Cabinet Dr. Benali"})
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({example: "+213 21 00 00 00"})
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({example: "contact@dr-benali.dz"})
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({example: "12 Rue Didouche Mourad, Alger"})
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({example: "Africa/Algiers"})
  @IsOptional()
  @IsString()
  @MaxLength(60)
  timezone?: string;

  @ApiPropertyOptional({enum: Locale, example: Locale.FR})
  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;
}
