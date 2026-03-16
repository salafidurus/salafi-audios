import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchResultItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  scholarName!: string;

  @ApiProperty()
  scholarSlug!: string;

  @ApiPropertyOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  scholarImageUrl?: string;

  @ApiProperty()
  lectureCount!: number;

  @ApiPropertyOptional()
  durationSeconds?: number;
}

export class SearchResultsDto {
  @ApiProperty({
    description: 'Matching collections',
    isArray: true,
    type: SearchResultItemDto,
  })
  collections!: SearchResultItemDto[];

  @ApiProperty({
    description: 'Matching series',
    isArray: true,
    type: SearchResultItemDto,
  })
  series!: SearchResultItemDto[];

  @ApiProperty({
    description: 'Matching lectures',
    isArray: true,
    type: SearchResultItemDto,
  })
  lectures!: SearchResultItemDto[];
}
