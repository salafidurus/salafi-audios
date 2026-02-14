import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RecommendationListQueryDto {
  @ApiPropertyOptional({ description: 'Page size', default: 8, maximum: 24 })
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(24)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Cursor for pagination (opaque string)' })
  @IsString()
  @IsOptional()
  cursor?: string;
}
