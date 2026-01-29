import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@sd/db/client';

export class LectureViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() scholarId!: string;

  @ApiPropertyOptional() seriesId?: string;

  @ApiProperty() slug!: string;
  @ApiProperty() title!: string;

  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() language?: string;

  @ApiProperty({ enum: Status }) status!: Status;

  @ApiPropertyOptional() publishedAt?: string;
  @ApiPropertyOptional() orderIndex?: number;
  @ApiPropertyOptional() durationSeconds?: number;

  @ApiPropertyOptional() deletedAt?: string;
  @ApiPropertyOptional() deleteAfterAt?: string;

  @ApiProperty() createdAt!: string;
  @ApiPropertyOptional() updatedAt?: string;
}
