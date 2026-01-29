import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@sd/db/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpsertCollectionDto {
  @ApiProperty({ example: 'lessons-on-tawheed' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'Lessons on Tawheed' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/covers/tawheed.jpg',
  })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 'ar' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ enum: Status, default: Status.draft })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({
    description: 'Soft delete timestamp (ISO). Use only if you need it now.',
  })
  @IsDateString()
  @IsOptional()
  deletedAt?: string;

  @ApiPropertyOptional({ description: 'Auto delete after timestamp (ISO)' })
  @IsDateString()
  @IsOptional()
  deleteAfterAt?: string;
}
