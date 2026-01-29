import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@sd/db/client';

export class CollectionViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() scholarId!: string;

  @ApiProperty({ description: 'URL-safe slug unique per scholar' })
  slug!: string;

  @ApiProperty() title!: string;

  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() coverImageUrl?: string;
  @ApiPropertyOptional() language?: string;

  @ApiProperty({ enum: Status })
  status!: Status;

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
