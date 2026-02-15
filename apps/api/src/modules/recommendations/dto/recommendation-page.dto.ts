import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecommendationItemDto } from './recommendation-item.dto';

export class RecommendationPageDto {
  @ApiProperty({ type: RecommendationItemDto, isArray: true })
  items!: RecommendationItemDto[];

  @ApiPropertyOptional({ description: 'Cursor for fetching the next page' })
  nextCursor?: string;
}
