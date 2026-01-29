import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@sd/db/client';

export class TopicLectureViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() scholarId!: string;
  @ApiPropertyOptional() seriesId?: string;
  @ApiProperty() slug!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() language?: string;
  @ApiProperty() status!: Status;
  @ApiPropertyOptional() publishedAt?: string;
  @ApiPropertyOptional() durationSeconds?: number;
}
