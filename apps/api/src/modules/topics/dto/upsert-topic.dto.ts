import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertTopicDto {
  @ApiProperty({ description: 'Stable, URL-safe slug (unique)' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ description: 'Display name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Optional parent topic slug' })
  @IsString()
  @IsOptional()
  parentSlug?: string;
}
