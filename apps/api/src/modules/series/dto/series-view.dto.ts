import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@sd/db/client';

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

  @ApiProperty({ enum: Status })
  status!: Status;

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
