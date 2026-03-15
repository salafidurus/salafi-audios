import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchQueryDto {
  @ApiPropertyOptional({
    description: 'Search query (matches title/name)',
    example: 'tawheed',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by language', example: 'ar' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: 'Filter by topic slug',
    example: 'aqeedah',
  })
  @IsString()
  @IsOptional()
  topicSlug?: string;

  @ApiPropertyOptional({
    description: 'Filter by scholar slug',
    example: 'shaykh-ibn-baz',
  })
  @IsString()
  @IsOptional()
  scholarSlug?: string;

  @ApiPropertyOptional({
    description: 'Max items per catalog type',
    default: 12,
    maximum: 30,
  })
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  limit?: number;
}
