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
    description: 'BigInt as string',
  })
  sizeBytes?: string;

  @ApiPropertyOptional()
  durationSeconds?: number;

  @ApiPropertyOptional()
  source?: string;

  @ApiProperty()
  isPrimary!: boolean;

  @ApiProperty()
  createdAt!: string;
}
