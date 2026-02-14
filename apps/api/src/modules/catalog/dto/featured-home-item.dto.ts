import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeaturedHomeItemDto {
  @ApiProperty({ enum: ['series', 'collection', 'lecture'] })
  kind!: 'series' | 'collection' | 'lecture';

  @ApiProperty({
    description: 'The backing entity id (series/collection/lecture)',
  })
  entityId!: string;

  @ApiProperty({
    description:
      'The backing entity slug (used by clients to build canonical URLs)',
  })
  entitySlug!: string;

  @ApiProperty({ description: 'Hero message to display' })
  headline!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({
    description:
      'Number of lessons (for series/collection) or 1 (lecture). Optional when not precomputed.',
  })
  lessonCount?: number;

  @ApiPropertyOptional({
    description:
      'Total duration in seconds for the featured entity. Optional when not precomputed.',
  })
  totalDurationSeconds?: number;

  @ApiProperty({ description: 'Scholar/teacher presenting the study' })
  presentedBy!: string;

  @ApiPropertyOptional({ description: 'Slug for the scholar/teacher' })
  presentedBySlug?: string;

  @ApiPropertyOptional({
    description: 'Optional author of the studied work (if known)',
  })
  workAuthor?: string;
}
