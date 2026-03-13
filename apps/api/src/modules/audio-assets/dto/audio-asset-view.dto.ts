import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AudioAssetViewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  lectureId!: string;

  @ApiProperty()
  url!: string;

  @ApiPropertyOptional()
  format?: string;

  @ApiPropertyOptional()
  bitrateKbps?: number;

  @ApiPropertyOptional({
    description: 'File size in bytes',
  })
  sizeBytes?: number;

  @ApiPropertyOptional()
  durationSeconds?: number;

  @ApiPropertyOptional()
  source?: string;

  @ApiProperty()
  isPrimary!: boolean;

  @ApiProperty()
  createdAt!: string;
}
