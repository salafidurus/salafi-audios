import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertScholarDto {
  @ApiProperty({
    description: 'Stable, URL-safe slug for the scholar (unique)',
    example: 'shaykh-ibn-baz',
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({
    description: 'Display name of the scholar',
    example: 'Shaykh Abdul Aziz ibn Baz',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Short bio or description',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Country of the scholar',
    example: 'Saudi Arabia',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'Primary language of the scholar',
    example: 'ar',
  })
  @IsString()
  @IsOptional()
  mainLanguage?: string;

  @ApiPropertyOptional({
    description: 'URL to the scholar profile image',
    example: 'https://cdn.example.com/scholars/ibn-baz.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether this scholar is currently active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
