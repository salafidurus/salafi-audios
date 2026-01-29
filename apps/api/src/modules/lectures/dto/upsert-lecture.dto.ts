import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@sd/db/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpsertLectureDto {
  @ApiProperty({ description: 'Stable, URL-safe slug unique per scholar' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ description: 'Lecture title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ enum: Status, default: Status.draft })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ description: 'ISO string if published' })
  @IsString()
  @IsOptional()
  publishedAt?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  durationSeconds?: number;

  @ApiPropertyOptional({
    description: 'Optional parent series slug (belongs to same scholar)',
    example: 'kitab-al-tawhid',
  })
  @IsString()
  @IsOptional()
  seriesSlug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deletedAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deleteAfterAt?: string;
}
