import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  scholarId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
