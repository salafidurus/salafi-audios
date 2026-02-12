import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_VALUES, type StatusValue } from '@/shared/enums/status-values';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpsertSeriesDto {
  @ApiProperty({ description: 'Stable, URL-safe slug unique per scholar' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ description: 'Series title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Series description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    type: String,
    enum: STATUS_VALUES,
    default: STATUS_VALUES[0],
  })
  @IsIn(STATUS_VALUES)
  @IsOptional()
  status?: StatusValue;

  @ApiPropertyOptional({
    description: 'Optional ordering within scholar/collection',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({
    description: 'Optional parent collection slug (belongs to same scholar)',
    example: 'selected-fatawa',
  })
  @IsString()
  @IsOptional()
  collectionSlug?: string;

  @ApiPropertyOptional({ description: 'Soft delete time ISO string' })
  @IsString()
  @IsOptional()
  deletedAt?: string;

  @ApiPropertyOptional({ description: 'Auto delete time ISO string' })
  @IsString()
  @IsOptional()
  deleteAfterAt?: string;
}
