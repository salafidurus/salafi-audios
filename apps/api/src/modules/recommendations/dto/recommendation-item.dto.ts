import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecommendationItemDto {
  @ApiProperty({ enum: ['series', 'collection', 'lecture'] })
  kind!: 'series' | 'collection' | 'lecture';

  @ApiProperty({ description: 'The backing entity id' })
  entityId!: string;

  @ApiProperty({ description: 'The backing entity slug' })
  entitySlug!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Number of lessons (series/collection) or 1 (lecture).',
  })
  lessonCount?: number;

  @ApiPropertyOptional({
    description: 'Total duration in seconds for the recommended entity.',
  })
  totalDurationSeconds?: number;

  @ApiProperty({ description: 'Scholar/teacher presenting the study' })
  scholarName!: string;

  @ApiPropertyOptional({ description: 'Slug for the scholar/teacher' })
  scholarSlug?: string;
}
