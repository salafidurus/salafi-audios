import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_VALUES, type StatusValue } from '@/shared/enums/status-values';

export class SeriesViewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  scholarId!: string;

  @ApiPropertyOptional({
    description: 'Optional parent collection id',
  })
  collectionId?: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  language?: string;

  @ApiProperty({ type: String, enum: STATUS_VALUES })
  status!: StatusValue;

  @ApiPropertyOptional()
  orderIndex?: number;

  @ApiPropertyOptional()
  deletedAt?: string;

  @ApiPropertyOptional()
  deleteAfterAt?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  updatedAt?: string;
}
