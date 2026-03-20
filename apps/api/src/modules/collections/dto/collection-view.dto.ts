import {
  STATUS_VALUES,
  type StatusValue,
} from '../../../shared/enums/status-values';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollectionViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() scholarId!: string;

  @ApiProperty({ description: 'URL-safe slug unique per scholar' })
  slug!: string;

  @ApiProperty() title!: string;

  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() coverImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Number of published lectures that belong to this collection',
  })
  publishedLectureCount?: number;

  @ApiPropertyOptional({
    description:
      'Total duration (seconds) across published lectures in this collection',
  })
  publishedDurationSeconds?: number;

  @ApiPropertyOptional() language?: string;

  @ApiProperty({ type: String, enum: STATUS_VALUES })
  status!: StatusValue;

  @ApiPropertyOptional() orderIndex?: number;

  @ApiPropertyOptional({
    description: 'Soft-delete marker (if set, record is treated as deleted)',
  })
  deletedAt?: string;

  @ApiPropertyOptional()
  deleteAfterAt?: string;

  @ApiProperty() createdAt!: string;
  @ApiPropertyOptional() updatedAt?: string;
}
