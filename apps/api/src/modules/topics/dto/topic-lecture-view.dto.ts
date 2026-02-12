import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_VALUES, type StatusValue } from '@/shared/enums/status-values';

export class TopicLectureViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() scholarId!: string;
  @ApiPropertyOptional() seriesId?: string;
  @ApiProperty() slug!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() language?: string;
  @ApiProperty({ type: String, enum: STATUS_VALUES }) status!: StatusValue;
  @ApiPropertyOptional() publishedAt?: string;
  @ApiPropertyOptional() durationSeconds?: number;
}
