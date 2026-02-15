import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  AnalyticsContentKind,
  AnalyticsEventType,
  AnalyticsSource,
} from '@sd/db';

export class CreateAnalyticsEventDto {
  @ApiProperty({ enum: AnalyticsContentKind })
  @IsEnum(AnalyticsContentKind)
  contentKind!: AnalyticsContentKind;

  @ApiProperty()
  @IsString()
  contentId!: string;

  @ApiProperty({ enum: AnalyticsEventType })
  @IsEnum(AnalyticsEventType)
  eventType!: AnalyticsEventType;

  @ApiPropertyOptional({ enum: AnalyticsSource, default: AnalyticsSource.web })
  @IsEnum(AnalyticsSource)
  @IsOptional()
  source?: AnalyticsSource;
}
