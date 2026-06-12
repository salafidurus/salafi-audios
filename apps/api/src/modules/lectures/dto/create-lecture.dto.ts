import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateLectureDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  scholarId!: string;

  @IsOptional()
  @IsString()
  seriesId?: string;

  @IsOptional()
  @IsArray()
  topics?: string[];

  @IsString()
  audioKey!: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  sizeBytes?: number;
}
