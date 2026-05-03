import {Type} from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

export class WorkingHoursEntryDto {
  @ApiProperty({
    description: "0 = Sunday … 6 = Saturday",
    minimum: 0,
    maximum: 6,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiPropertyOptional({example: "08:30"})
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiPropertyOptional({example: "18:00"})
  @IsOptional()
  @IsString()
  closeTime?: string;

  @ApiProperty()
  @IsBoolean()
  isClosed!: boolean;
}

export class UpsertWorkingHoursDto {
  @ApiProperty({type: [WorkingHoursEntryDto]})
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => WorkingHoursEntryDto)
  entries!: WorkingHoursEntryDto[];
}
