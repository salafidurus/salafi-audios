import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_VALUES, type StatusValue } from '@/shared/enums/status-values';
import { AudioAssetViewDto } from '@/modules/audio-assets/dto/audio-asset-view.dto';

export class LectureViewDto {
  @ApiProperty() id!: string;
  @ApiProperty() scholarId!: string;

  @ApiPropertyOptional() seriesId?: string;

  @ApiProperty() slug!: string;
  @ApiProperty() title!: string;

  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() language?: string;

  @ApiProperty({ type: String, enum: STATUS_VALUES }) status!: StatusValue;

  @ApiPropertyOptional() publishedAt?: string;
  @ApiPropertyOptional() orderIndex?: number;
  @ApiPropertyOptional() durationSeconds?: number;
  @ApiPropertyOptional({ type: AudioAssetViewDto })
  primaryAudioAsset?: AudioAssetViewDto;

  @ApiPropertyOptional() deletedAt?: string;
  @ApiPropertyOptional() deleteAfterAt?: string;

  @ApiProperty() createdAt!: string;
  @ApiPropertyOptional() updatedAt?: string;
}
